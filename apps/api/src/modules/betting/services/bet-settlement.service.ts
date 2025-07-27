import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SettleBetsUseCase } from '@betola/core/modules/betting/application/use-cases/settle-bets';
import { MatchesRepository } from '@betola/core/modules/matches/domain/repositories/matches-repository';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';
import { MatchStatus, MatchStatusVO } from '@betola/core/modules/matches/domain/value-objects/match-status';

@Injectable()
export class BetSettlementService {
  private readonly logger = new Logger(BetSettlementService.name);

  constructor(
    private readonly settleBetsUseCase: SettleBetsUseCase,
    @Inject('MatchesRepository') private readonly matchesRepository: MatchesRepository,
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService
  ) {}

  // Run every 10 minutes to check for finished matches
  @Cron('*/10 * * * *')
  async checkAndSettleBets() {
    this.logger.log('Starting bet settlement check...');
    
    try {
      // First, update match results from API
      await this.updateMatchResults();
      
      // Then settle bets
      const result = await this.settleBetsUseCase.execute();
      
      if (result.isSuccess) {
        if (result.value.settledCount > 0) {
          this.logger.log(`Settled ${result.value.settledCount} bets successfully`);
        }
        
        if (result.value.errors.length > 0) {
          this.logger.warn(`Settlement errors: ${result.value.errors.join(', ')}`);
        }
      } else {
        this.logger.error(`Failed to settle bets: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Bet settlement failed', error);
    }
  }

  private async updateMatchResults(): Promise<void> {
    try {
      // Get matches that might have finished recently
      const recentMatches = await this.matchesRepository.findByStatus(
        new MatchStatusVO(MatchStatus.LIVE)
      );
      
      // Also check scheduled matches that should have started
      const scheduledMatches = await this.matchesRepository.findByStatus(
        new MatchStatusVO(MatchStatus.SCHEDULED)
      );
      
      const now = new Date();
      const matchesToCheck = [
        ...recentMatches,
        ...scheduledMatches.filter(m => {
          const kickoff = new Date(m.kickoffTime.value);
          // Check matches that should have started more than 2 hours ago
          return kickoff.getTime() < now.getTime() - (2 * 60 * 60 * 1000);
        })
      ];

      for (const match of matchesToCheck) {
        if (!match.externalId) continue;
        
        try {
          // Get updated match data from API
          const fixtures = await this.footballApiService.getFixtures(
            parseInt(match.externalId),
            parseInt(match.season)
          );
          
          const fixture = fixtures.response.find(
            f => f.fixture.id.toString() === match.externalId
          );
          
          if (fixture) {
            // Update match status
            const apiStatus = fixture.fixture.status.short;
            
            if (apiStatus === 'FT' || apiStatus === 'AET' || apiStatus === 'PEN') {
              // Match finished
              if (fixture.goals.home !== null && fixture.goals.away !== null) {
                match.updateScore(fixture.goals.home, fixture.goals.away);
                match.markAsFinished();
                await this.matchesRepository.update(match);
                this.logger.log(`Updated finished match ${match.id.value}: ${fixture.goals.home} - ${fixture.goals.away}`);
              }
            } else if (['1H', 'HT', '2H', 'ET', 'P'].includes(apiStatus)) {
              // Match is live
              if (!match.status.isLive()) {
                match.markAsLive();
                await this.matchesRepository.update(match);
              }
            }
          }
        } catch (error) {
          this.logger.error(`Failed to update match ${match.id.value}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to update match results', error);
    }
  }

  // Manual trigger for immediate settlement
  async settleBetsManually(): Promise<{ settledCount: number; errors: string[] }> {
    this.logger.log('Manual bet settlement triggered');
    
    try {
      await this.updateMatchResults();
      const result = await this.settleBetsUseCase.execute();
      
      if (result.isSuccess) {
        return result.value;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.logger.error('Manual settlement failed', error);
      throw error;
    }
  }
}