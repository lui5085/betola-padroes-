import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ExternalApiService } from './external-api-service';
import { 
  Match,
  MatchId,
  TeamId,
  DateTime,
  MatchStatus,
  MatchStatusVO
} from '@betola/core';
import { ExternalMatch } from '@betola/core/modules/matches/domain/services/external-api-types';

@Injectable()
export class MatchSyncService {
  private readonly logger = new Logger(MatchSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly externalApi: ExternalApiService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncMatches() {
    this.logger.log('Starting match synchronization...');
    
    try {
      const oddsResponse = await this.externalApi.fetchOdds();
      
      for (const externalMatch of oddsResponse.rodada) {
        await this.processMatch(externalMatch);
      }
      
      this.logger.log('Match synchronization completed');
    } catch (error) {
      this.logger.error('Match synchronization failed', error);
    }
  }

  private async processMatch(externalMatch: ExternalMatch) {
    try {
      // Busca ou cria os times
      const homeTeam = await this.findOrCreateTeam(externalMatch.mandante);
      const awayTeam = await this.findOrCreateTeam(externalMatch.visitante);
      
      // Busca partida existente
      const existingMatch = await this.prisma.match.findFirst({
        where: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          status: 'SCHEDULED'
        }
      });
      
      if (existingMatch) {
        // Atualiza mercados
        await this.updateMarkets(existingMatch.id, externalMatch);
      } else {
        // Cria nova partida
        const match = await this.createMatch(homeTeam.id, awayTeam.id);
        await this.createMarkets(match.id, externalMatch);
      }
    } catch (error) {
      this.logger.error(`Failed to process match ${externalMatch.mandante} vs ${externalMatch.visitante}`, error);
    }
  }

  private async findOrCreateTeam(teamName: string) {
    let team = await this.prisma.team.findFirst({
      where: { name: teamName }
    });
    
    if (!team) {
      team = await this.prisma.team.create({
        data: {
          name: teamName,
          shortName: this.getShortName(teamName),
          logoUrl: null
        }
      });
    }
    
    return team;
  }

  private async createMatch(homeTeamId: string, awayTeamId: string) {
    // Por padrão, marca partida para daqui a 2 dias
    const kickoffTime = new Date();
    kickoffTime.setDate(kickoffTime.getDate() + 2);
    kickoffTime.setHours(16, 0, 0, 0);
    
    return await this.prisma.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        kickoffTime,
        status: 'SCHEDULED',
        round: this.getCurrentRound(),
        season: new Date().getFullYear().toString()
      }
    });
  }

  private async createMarkets(matchId: string, externalMatch: ExternalMatch) {
    const markets = this.convertToMarkets(matchId, externalMatch);
    
    await this.prisma.market.createMany({
      data: markets
    });
  }

  private async updateMarkets(matchId: string, externalMatch: ExternalMatch) {
    // Remove mercados antigos
    await this.prisma.market.deleteMany({
      where: { matchId }
    });
    
    // Cria novos mercados com odds atualizadas
    await this.createMarkets(matchId, externalMatch);
  }

  private convertToMarkets(matchId: string, externalMatch: ExternalMatch) {
    const markets = [];
    
    // Resultado Final (1X2)
    markets.push({
      matchId,
      type: 'MATCH_WINNER',
      name: 'Resultado Final',
      options: JSON.stringify([
        { name: 'Home', odds: externalMatch.odds["resultado final"].casa },
        { name: 'Draw', odds: externalMatch.odds["resultado final"].empate },
        { name: 'Away', odds: externalMatch.odds["resultado final"].fora }
      ]),
      isActive: true
    });
    
    // Ambos Marcam
    markets.push({
      matchId,
      type: 'BOTH_TEAMS_SCORE',
      name: 'Ambos Marcam',
      options: JSON.stringify([
        { name: 'Yes', odds: externalMatch.odds.ambos_marcam.sim },
        { name: 'No', odds: externalMatch.odds.ambos_marcam.nao }
      ]),
      isActive: true
    });
    
    // Over/Under 2.5
    if (externalMatch.odds.total_de_gols["2.5"]) {
      markets.push({
        matchId,
        type: 'OVER_UNDER_GOALS',
        name: 'Acima/Abaixo 2.5 Gols',
        options: JSON.stringify([
          { name: 'Over 2.5', odds: externalMatch.odds.total_de_gols["2.5"].mais },
          { name: 'Under 2.5', odds: externalMatch.odds.total_de_gols["2.5"].menos }
        ]),
        isActive: true
      });
    }
    
    // Over/Under 1.5
    if (externalMatch.odds.total_de_gols["1.5"]) {
      markets.push({
        matchId,
        type: 'OVER_UNDER_GOALS',
        name: 'Acima/Abaixo 1.5 Gols',
        options: JSON.stringify([
          { name: 'Over 1.5', odds: externalMatch.odds.total_de_gols["1.5"].mais },
          { name: 'Under 1.5', odds: externalMatch.odds.total_de_gols["1.5"].menos }
        ]),
        isActive: true
      });
    }
    
    return markets;
  }

  private getShortName(teamName: string): string {
    const shortNames: Record<string, string> = {
      'Flamengo': 'FLA',
      'Palmeiras': 'PAL',
      'São Paulo': 'SPO',
      'Atlético-MG': 'CAM',
      'Botafogo': 'BOT',
      'Fluminense': 'FLU',
      'Internacional': 'INT',
      'Grêmio': 'GRE',
      'Corinthians': 'COR',
      'Santos': 'SAN',
      'Bahia': 'BAH',
      'Fortaleza': 'FOR',
      'Cruzeiro': 'CRU',
      'Vasco': 'VAS',
      'Sport Recife': 'SPT',
      'Ceará': 'CEA',
      'Juventude': 'JUV',
      'RB Bragantino': 'RBB',
      'Vitória': 'VIT',
      'Mirassol': 'MIR'
    };
    
    return shortNames[teamName] || teamName.substring(0, 3).toUpperCase();
  }

  private getCurrentRound(): number {
    // Lógica simplificada - pode ser melhorada
    const startDate = new Date(new Date().getFullYear(), 3, 1); // 1 de abril
    const now = new Date();
    const weeksDiff = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.min(Math.max(1, weeksDiff + 1), 38);
  }
}