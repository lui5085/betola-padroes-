import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ExternalApiService } from './external-api-service';
import {
  Match as ExternalMatch,
  ExternalOddsResponse,
} from '@betola/core/modules/matches/domain/services/external-api-types';

@Injectable()
export class MatchSyncService {
  private readonly logger = new Logger(MatchSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly externalApi: ExternalApiService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncBrasileiraoData() {
    this.logger.log('Starting Brasileirão data synchronization...');
    try {
      // 1. Buscar rodada atual
      const currentMatchday = await this.externalApi.fetchCurrentMatchday();
      this.logger.log(`Current matchday is: ${currentMatchday}`);

      // 2. Buscar partidas da rodada
      const matches = await this.externalApi.fetchMatchesByMatchday(currentMatchday);
      this.logger.log(`Found ${matches.length} matches for matchday ${currentMatchday}.`);

      // 3. Buscar odds
      const oddsData = await this.externalApi.fetchOdds();
      this.logger.log(`Found odds for ${oddsData.rodada.length} matches.`);

      // 4. Sincronizar no banco
      for (const match of matches) {
        await this.syncMatch(match, oddsData);
      }

      this.logger.log('Brasileirão data synchronization finished successfully.');
    } catch (error) {
      this.logger.error('Error during Brasileirão data synchronization', error.stack);
    }
  }

  private async syncMatch(match: ExternalMatch, oddsData: ExternalOddsResponse) {
    // Lógica para encontrar/criar times, partida e mercados
    const homeTeam = await this.findOrCreateTeam(match.homeTeam);
    const awayTeam = await this.findOrCreateTeam(match.awayTeam);

    const matchOdds = this.findOddsForMatch(match, oddsData);

    const matchData = {
      externalId: match.id.toString(),
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      kickoffTime: new Date(match.utcDate),
      status: match.status,
      round: match.matchday,
      season: match.season.startDate.substring(0, 4),
      homeScore: match.score.fullTime.home,
      awayScore: match.score.fullTime.away,
    };

    const createdOrUpdatedMatch = await this.prisma.match.upsert({
      where: { externalId: match.id.toString() },
      update: matchData,
      create: matchData,
    });

    if (matchOdds) {
      await this.syncMarketsForMatch(createdOrUpdatedMatch.id, matchOdds.odds);
    }
  }

  private async findOrCreateTeam(teamData: any) {
    const team = await this.prisma.team.findUnique({
      where: { externalId: teamData.id.toString() },
    });

    if (team) {
      return team;
    }

    return this.prisma.team.create({
      data: {
        externalId: teamData.id.toString(),
        name: teamData.name,
        shortName: teamData.shortName,
        logoUrl: teamData.crest,
      },
    });
  }

  private findOddsForMatch(match: ExternalMatch, oddsData: ExternalOddsResponse) {
    // Normaliza nomes para comparação (ex: remove acentos, 'FC', etc.)
    const normalize = (name: string) => name.toLowerCase().replace(/ fc$/, '').trim();
    const homeName = normalize(match.homeTeam.name);
    const awayName = normalize(match.awayTeam.name);
    
    return oddsData.rodada.find(o => 
      normalize(o.mandante) === homeName && normalize(o.visitante) === awayName
    );
  }

  private async syncMarketsForMatch(matchId: string, odds: any) {
    // Lógica para criar/atualizar mercados (1x2, Dupla Chance, etc.)
    if (odds['resultado final']) {
      const marketData = {
        matchId,
        type: 'MATCH_WINNER',
        name: 'Resultado Final',
        options: JSON.stringify([
          { name: '1', odds: odds['resultado final'].casa, isSuspended: false },
          { name: 'X', odds: odds['resultado final'].empate, isSuspended: false },
          { name: '2', odds: odds['resultado final'].fora, isSuspended: false },
        ]),
      };
      await this.prisma.market.upsert({
        where: { 
          matchId_type: { 
            matchId, 
            type: 'MATCH_WINNER' 
          } 
        },
        update: { options: marketData.options },
        create: marketData,
      });
    }
    // Adicionar lógica para outros mercados (chance_dupla, ambos_marcam, etc.) aqui
  }
}