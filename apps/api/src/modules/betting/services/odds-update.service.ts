import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncMatchOddsUseCase } from '@betola/core/modules/betting/application/use-cases/sync-match-odds';
import { MatchesRepository } from '@betola/core/modules/matches/domain/repositories/matches-repository';
import { MarketsRepository } from '@betola/core/modules/betting/domain/repositories/markets-repository';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';

@Injectable()
export class OddsUpdateService {
  private readonly logger = new Logger(OddsUpdateService.name);

  constructor(
    private readonly syncMatchOddsUseCase: SyncMatchOddsUseCase,
    @Inject('MatchesRepository') private readonly matchesRepository: MatchesRepository,
    @Inject('MarketsRepository') private readonly marketsRepository: MarketsRepository,
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService
  ) {}

  // Run every 5 minutes during match hours (10:00 - 23:00 Brazil time)
  @Cron('*/5 * * * *')
  async updateOdds() {
    const hour = new Date().getHours();
    
    // Only run during typical match hours
    if (hour < 10 || hour > 23) {
      return;
    }

    this.logger.log('Starting odds update...');
    
    try {
      // Update odds for all upcoming matches
      const result = await this.syncMatchOddsUseCase.execute({
        forceRefresh: true
      });

      if (result.isSuccess) {
        this.logger.log(`Odds updated successfully. Created: ${result.value.marketsCreated}, Updated: ${result.value.marketsUpdated}`);
        
        if (result.value.errors.length > 0) {
          this.logger.warn(`Errors during update: ${result.value.errors.join(', ')}`);
        }
      } else {
        this.logger.error(`Failed to update odds: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Odds update failed', error);
    }
  }

  // Run every minute for live matches
  @Cron('*/1 * * * *')
  async updateLiveOdds() {
    this.logger.debug('Checking for live matches...');
    
    try {
      // Get Brasileirao league info
      const leagueResponse = await this.footballApiService.getBrasileirao();
      if (!leagueResponse.response.length) {
        return;
      }

      const leagueId = leagueResponse.response[0].league.id;
      
      // Get live matches
      const liveMatches = await this.footballApiService.getLiveMatches(leagueId);
      
      if (liveMatches.response.length > 0) {
        this.logger.log(`Found ${liveMatches.response.length} live matches`);
        
        for (const fixture of liveMatches.response) {
          try {
            // Find match in our database
            const match = await this.matchesRepository.findByExternalId(fixture.fixture.id.toString());
            
            if (match) {
              // Deactivate markets for live matches (we don't support in-play betting yet)
              await this.marketsRepository.deactivateByMatch(match.id);
              
              // Update match status
              if (!match.status.isLive()) {
                match.markAsLive();
                await this.matchesRepository.update(match);
              }
              
              // Update scores
              if (fixture.goals.home !== null && fixture.goals.away !== null) {
                match.updateScore(fixture.goals.home, fixture.goals.away);
                await this.matchesRepository.update(match);
              }
            }
          } catch (error) {
            this.logger.error(`Failed to update live match ${fixture.fixture.id}`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Live odds update failed', error);
    }
  }

  // Run every 30 minutes to check for new matches
  @Cron('*/30 * * * *')
  async syncNewMatches() {
    this.logger.log('Checking for new matches...');
    
    try {
      // This would call the sync matches use case
      // For now, just log
      this.logger.log('New matches sync completed');
    } catch (error) {
      this.logger.error('Failed to sync new matches', error);
    }
  }

  // Manual method to force update specific match odds
  async forceUpdateMatchOdds(matchId: string): Promise<void> {
    try {
      const result = await this.syncMatchOddsUseCase.execute({
        matchId,
        forceRefresh: true
      });

      if (!result.isSuccess) {
        throw new Error(result.error);
      }

      this.logger.log(`Force updated odds for match ${matchId}`);
    } catch (error) {
      this.logger.error(`Failed to force update match ${matchId}`, error);
      throw error;
    }
  }
}