import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncBrasileraoDataUseCase } from '@betola/core/modules/matches/application/use-cases/sync-brasileirao-data';
import { SyncMatchOddsUseCase } from '../use-cases/sync-match-odds.use-case';
import { SettleBetsUseCase } from '@betola/core/modules/betting/application/use-cases/settle-bets';
import { SyncTeamsUseCase } from '@betola/core/modules/matches/application/use-cases/sync-teams';

@Injectable()
export class BettingJobsService {
  private readonly logger = new Logger(BettingJobsService.name);

  constructor(
    private readonly syncBrasileraoDataUseCase: SyncBrasileraoDataUseCase,
    private readonly syncMatchOddsUseCase: SyncMatchOddsUseCase,
    private readonly settleBetsUseCase: SettleBetsUseCase,
    private readonly syncTeamsUseCase: SyncTeamsUseCase
  ) {}

  // Sync teams once a day at 6 AM
  @Cron('0 6 * * *')
  async syncTeams() {
    this.logger.log('Starting teams synchronization...');
    
    try {
      const result = await this.syncTeamsUseCase.execute();
      
      if (result.isSuccess) {
        this.logger.log(`Teams sync completed: ${JSON.stringify(result.value)}`);
      } else {
        this.logger.error(`Teams sync failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Teams sync error:', error);
    }
  }

  // Sync match data every hour
  @Cron(CronExpression.EVERY_HOUR)
  async syncMatches() {
    this.logger.log('Starting match data synchronization...');
    
    try {
      const result = await this.syncBrasileraoDataUseCase.execute();
      
      if (result.isSuccess) {
        this.logger.log(`Match sync completed: ${JSON.stringify(result.value)}`);
      } else {
        this.logger.error(`Match sync failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Match sync error:', error);
    }
  }

  // Sync odds every 5 minutes
  @Cron('*/5 * * * *')
  async syncOdds() {
    this.logger.log('Starting odds synchronization...');
    
    try {
      const result = await this.syncMatchOddsUseCase.execute();
      
      if (result.isSuccess) {
        this.logger.log(`Odds sync completed: ${JSON.stringify(result.value)}`);
      } else {
        this.logger.error(`Odds sync failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Odds sync error:', error);
    }
  }

  // Settle bets every 10 minutes
  @Cron('*/10 * * * *')
  async settleBets() {
    this.logger.log('Starting bet settlement...');
    
    try {
      const result = await this.settleBetsUseCase.execute();
      
      if (result.isSuccess) {
        const { settledCount, errors } = result.value;
        if (settledCount > 0) {
          this.logger.log(`Bet settlement completed: ${settledCount} bets settled`);
          if (errors.length > 0) {
            this.logger.warn(`Settlement errors: ${errors.join(', ')}`);
          }
        }
      } else {
        this.logger.error(`Bet settlement failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Bet settlement error:', error);
    }
  }

  // Manual sync methods for admin use
  async manualSyncAll() {
    this.logger.log('Starting manual full synchronization...');
    
    try {
      // Sync teams first
      await this.syncTeams();
      
      // Then matches
      await this.syncMatches();
      
      // Then odds
      await this.syncOdds();
      
      // Finally settle any pending bets
      await this.settleBets();
      
      this.logger.log('Manual full synchronization completed');
    } catch (error) {
      this.logger.error('Manual sync error:', error);
      throw error;
    }
  }
}