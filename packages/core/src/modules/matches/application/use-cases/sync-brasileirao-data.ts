import { Result } from '../../../../shared/application/result';
import { FootballApiService } from '../../domain/services/football-api-service';
import { MatchesRepository } from '../../domain/repositories/matches-repository';
import { Match } from '../../domain/entities/match';
import { MatchId } from '../../domain/value-objects/match-id';
import { TeamId } from '../../domain/value-objects/team-id';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';
import { MatchStatus, MatchStatusVO } from '../../domain/value-objects/match-status';

export interface SyncBrasileraoDataRequest {
  forceRefresh?: boolean;
}

export interface SyncBrasileraoDataResponse {
  matchesSynced: number;
  matchesUpdated: number;
  errors: string[];
}

export class SyncBrasileraoDataUseCase {
  constructor(
    private readonly footballApiService: FootballApiService,
    private readonly matchesRepository: MatchesRepository
  ) {}

  async execute(request: SyncBrasileraoDataRequest = {}): Promise<Result<SyncBrasileraoDataResponse>> {
    try {
      // Step 1: Get Brasileirao league data
      const leagueResponse = await this.footballApiService.getBrasileirao();
      
      if (!leagueResponse.response.length) {
        return Result.failure('Brasileirao league not found');
      }

      const league = leagueResponse.response[0];
      // Use 2023 season as free plan only has access to 2021-2023
      const availableSeason = league.seasons.find(s => s.year === 2023) || league.seasons[league.seasons.length - 1];
      
      if (!availableSeason) {
        return Result.failure('No available Brasileirao season found');
      }

      const leagueId = league.league.id;
      const season = availableSeason.year;

      // Step 2: Get current round
      const roundResponse = await this.footballApiService.getCurrentRound(leagueId, season);
      const currentRound = roundResponse.response[0];

      if (!currentRound) {
        return Result.failure('Current round not found');
      }

      // Step 3: Get fixtures for current round
      const fixturesResponse = await this.footballApiService.getFixtures(leagueId, season, currentRound);
      
      let matchesSynced = 0;
      let matchesUpdated = 0;
      const errors: string[] = [];

      // Step 4: Process each fixture
      for (const fixture of fixturesResponse.response) {
        try {
          const existingMatch = await this.matchesRepository.findByExternalId(fixture.fixture.id.toString());
          
          if (existingMatch) {
            // Update existing match
            const updated = this.updateExistingMatch(existingMatch, fixture);
            if (updated) {
              await this.matchesRepository.save(existingMatch);
              matchesUpdated++;
            }
          } else {
            // Create new match
            const newMatch = this.createMatchFromFixture(fixture, season.toString());
            await this.matchesRepository.save(newMatch);
            matchesSynced++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to process fixture ${fixture.fixture.id}: ${errorMessage}`);
        }
      }

      return Result.success({
        matchesSynced,
        matchesUpdated,
        errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to sync Brasileirao data: ${errorMessage}`);
    }
  }

  private createMatchFromFixture(fixture: any, season: string): Match {
    const roundNumber = this.extractRoundNumber(fixture.league.round);
    
    return new Match({
      id: MatchId.create(),
      externalId: fixture.fixture.id.toString(),
      homeTeamId: new TeamId(fixture.teams.home.id.toString()),
      awayTeamId: new TeamId(fixture.teams.away.id.toString()),
      kickoffTime: new DateTime(fixture.fixture.date),
      status: this.mapApiStatusToMatchStatus(fixture.fixture.status.short),
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
      round: roundNumber,
      season
    });
  }

  private updateExistingMatch(match: Match, fixture: any): boolean {
    let updated = false;

    // Update status
    const newStatus = this.mapApiStatusToMatchStatus(fixture.fixture.status.short);
    if (!match.status.equals(newStatus)) {
      if (newStatus.isLive()) {
        match.markAsLive();
      } else if (newStatus.isFinished()) {
        match.markAsFinished();
      }
      updated = true;
    }

    // Update scores
    const newHomeScore = fixture.goals.home;
    const newAwayScore = fixture.goals.away;
    
    if (newHomeScore !== null && newAwayScore !== null) {
      if (match.homeScore !== newHomeScore || match.awayScore !== newAwayScore) {
        match.updateScore(newHomeScore, newAwayScore);
        updated = true;
      }
    }

    return updated;
  }
  v3.football.api-sports.io
  private mapApiStatusToMatchStatus(apiStatus: string): MatchStatusVO {
    switch (apiStatus) {
      case 'NS': // Not Started
      case 'TBD': // To Be Determined
        return new MatchStatusVO(MatchStatus.SCHEDULED);
      case '1H': // First Half
      case 'HT': // Half Time
      case '2H': // Second Half
      case 'ET': // Extra Time
      case 'P': // Penalty
        return new MatchStatusVO(MatchStatus.LIVE);
      case 'FT': // Full Time
      case 'AET': // After Extra Time
      case 'PEN': // Penalty
        return new MatchStatusVO(MatchStatus.FINISHED);
      case 'SUSP': // Suspended
      case 'INT': // Interrupted
        return new MatchStatusVO(MatchStatus.POSTPONED);
      case 'PST': // Postponed
      case 'CANC': // Cancelled
        return new MatchStatusVO(MatchStatus.POSTPONED);
      default:
        return new MatchStatusVO(MatchStatus.SCHEDULED);
    }
  }

  private extractRoundNumber(roundString: string): number {
    // Extract number from strings like "Regular Season - 15"
    const match = roundString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }
}