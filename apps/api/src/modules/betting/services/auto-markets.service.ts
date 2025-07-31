import { Injectable, Inject } from '@nestjs/common';
import { MarketsRepository } from '@betola/core/modules/betting/domain/repositories/markets-repository';
import { MatchId } from '@betola/core/modules/matches/domain/value-objects/match-id';

@Injectable()
export class AutoMarketsService {
  constructor(
    @Inject('MarketsRepository')
    private readonly marketsRepository: MarketsRepository
  ) {}

  async createMarketsForMatch(matchId: string, homeTeam: string, awayTeam: string): Promise<void> {
    try {
      const matchIdVO = MatchId.fromString(matchId);
      
      // Check if markets already exist for this match
      const existingMarkets = await this.marketsRepository.findActiveByMatch(matchIdVO);
      if (existingMarkets.length > 0) {
        console.log(`Markets already exist for match ${matchId}`);
        return;
      }

      console.log(`Creating markets for ${homeTeam} vs ${awayTeam}`);

      const markets = [
        // Match Winner (1X2)
        {
          matchId,
          type: 'MATCH_WINNER',
          name: 'Resultado Final',
          options: [
            { name: homeTeam, odds: this.generateOdds(1.8, 3.5), isSuspended: false },
            { name: 'Empate', odds: this.generateOdds(3.0, 3.8), isSuspended: false },
            { name: awayTeam, odds: this.generateOdds(1.8, 3.5), isSuspended: false }
          ],
          isActive: true
        },
        // Both Teams Score
        {
          matchId,
          type: 'BOTH_TEAMS_SCORE',
          name: 'Ambos Marcam',
          options: [
            { name: 'Sim', odds: this.generateOdds(1.6, 2.2), isSuspended: false },
            { name: 'Não', odds: this.generateOdds(1.6, 2.2), isSuspended: false }
          ],
          isActive: true
        },
        // Over/Under 2.5 Goals
        {
          matchId,
          type: 'OVER_UNDER_GOALS',
          name: 'Acima/Abaixo 2.5 Gols',
          options: [
            { name: 'Acima 2.5', odds: this.generateOdds(1.7, 2.3), isSuspended: false },
            { name: 'Abaixo 2.5', odds: this.generateOdds(1.7, 2.3), isSuspended: false }
          ],
          isActive: true
        },
        // Double Chance
        {
          matchId,
          type: 'DOUBLE_CHANCE',
          name: 'Dupla Chance',
          options: [
            { name: `${homeTeam} ou Empate`, odds: this.generateOdds(1.2, 1.6), isSuspended: false },
            { name: `${awayTeam} ou Empate`, odds: this.generateOdds(1.2, 1.6), isSuspended: false },
            { name: `${homeTeam} ou ${awayTeam}`, odds: this.generateOdds(1.1, 1.4), isSuspended: false }
          ],
          isActive: true
        }
      ];

      // Create markets using the repository or direct Prisma for simplicity
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      for (const market of markets) {
        await prisma.market.create({
          data: {
            id: this.generateUUID(),
            matchId: market.matchId,
            type: market.type,
            name: market.name,
            options: JSON.stringify(market.options),
            isActive: market.isActive
          }
        });
      }

      await prisma.$disconnect();
      console.log(`✅ Created ${markets.length} markets for match ${matchId}`);
    } catch (error) {
      console.error(`❌ Failed to create markets for match ${matchId}:`, error);
    }
  }

  private generateOdds(min: number, max: number): number {
    return parseFloat((min + Math.random() * (max - min)).toFixed(2));
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}