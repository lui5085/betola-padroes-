import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { SyncBrasileraoDataUseCase } from '@betola/core/modules/matches/application/use-cases/sync-brasileirao-data';
import { SyncTeamsUseCase } from '@betola/core/modules/matches/application/use-cases/sync-teams';
import { SyncMatchOddsUseCase } from '../modules/betting/use-cases/sync-match-odds.use-case';

@Injectable()
@Command({
  name: 'sync:brasileirao',
  description: 'Sync Brasileirao 2025 data from Football API',
})
export class SyncBrasileiraCommand extends CommandRunner {
  private readonly logger = new Logger(SyncBrasileiraCommand.name);

  constructor(
    private readonly syncBrasileraoDataUseCase: SyncBrasileraoDataUseCase,
    private readonly syncTeamsUseCase: SyncTeamsUseCase,
    private readonly syncMatchOddsUseCase: SyncMatchOddsUseCase
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Starting Brasileirao 2025 sync...');

    try {
      // Step 1: Sync teams
      this.logger.log('Syncing teams...');
      const teamsResult = await this.syncTeamsUseCase.execute({
        season: 2024,
        forceRefresh: true
      });

      if (teamsResult.isSuccess) {
        this.logger.log(`Teams synced - Created: ${teamsResult.value.teamsSynced}, Updated: ${teamsResult.value.teamsUpdated}`);
        if (teamsResult.value.errors.length > 0) {
          this.logger.warn(`Team sync errors: ${teamsResult.value.errors.join(', ')}`);
        }
      } else {
        this.logger.error(`Failed to sync teams: ${teamsResult.error}`);
      }

      // Step 2: Sync matches
      this.logger.log('Syncing matches...');
      const matchesResult = await this.syncBrasileraoDataUseCase.execute({
        forceRefresh: true
      });

      if (matchesResult.isSuccess) {
        this.logger.log(`Matches synced - Created: ${matchesResult.value.matchesSynced}, Updated: ${matchesResult.value.matchesUpdated}`);
        if (matchesResult.value.errors.length > 0) {
          this.logger.warn(`Match sync errors: ${matchesResult.value.errors.join(', ')}`);
        }
      } else {
        this.logger.error(`Failed to sync matches: ${matchesResult.error}`);
      }

      // Step 3: Sync odds for all matches
      this.logger.log('Syncing odds...');
      const oddsResult = await this.syncMatchOddsUseCase.execute({
        forceRefresh: true
      });

      if (oddsResult.isSuccess) {
        this.logger.log(`Odds synced - Created: ${oddsResult.value.marketsCreated}, Updated: ${oddsResult.value.marketsUpdated}`);
        if (oddsResult.value.errors.length > 0) {
          this.logger.warn(`Odds sync errors: ${oddsResult.value.errors.join(', ')}`);
        }
      } else {
        this.logger.error(`Failed to sync odds: ${oddsResult.error}`);
      }

      this.logger.log('Brasileirao 2025 sync completed!');
    } catch (error) {
      this.logger.error('Sync failed', error);
      throw error;
    }
  }
}