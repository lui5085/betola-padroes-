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
      
      if (!leagueResponse.id) {
        return Result.failure('Brasileirao league not found');
      }

      const league = leagueResponse;
      // Get current year for the season
      const currentYear = new Date().getFullYear();
      
      // Look for current season, fallback to most recent season
      const availableSeason = league.seasons.find(s => s.startDate.includes(currentYear.toString())) || 
                             league.seasons[league.seasons.length - 1];
      
      if (!availableSeason) {
        return Result.failure('No available Brasileirao season found');
      }

      const leagueId = league.id;
      const season = currentYear;

      // Step 2: Get all fixtures for current season to find the next matchday
      const fixturesResponse = await this.footballApiService.getFixtures(leagueId, season);
      
      if (!fixturesResponse.matches || fixturesResponse.matches.length === 0) {
        return Result.failure('No fixtures found for current season');
      }

      // Find the next matchday by looking for upcoming matches
      const now = new Date();
      const upcomingMatches = fixturesResponse.matches.filter(match => 
        new Date(match.utcDate) > now && (match.status === 'SCHEDULED' || match.status === 'TIMED')
      );
      
      if (upcomingMatches.length === 0) {
        return Result.failure('No upcoming matches found');
      }

      // Group upcoming matches by matchday and find the next complete round
      const matchdayGroups = new Map();
      upcomingMatches.forEach(match => {
        if (!matchdayGroups.has(match.matchday)) {
          matchdayGroups.set(match.matchday, []);
        }
        matchdayGroups.get(match.matchday).push(match);
      });

      // Find the next matchday with the most matches (likely a complete round)
      let nextMatchday = null;
      let maxMatches = 0;
      
      for (const [matchday, matches] of matchdayGroups.entries()) {
        const timedMatches = matches.filter(m => m.status === 'TIMED').length;
        if (timedMatches > maxMatches && timedMatches >= 5) { // At least 5 matches in a round
          maxMatches = timedMatches;
          nextMatchday = matchday;
        }
      }

      // If no good round found, fall back to the earliest matchday
      if (!nextMatchday) {
        nextMatchday = Math.min(...upcomingMatches.map(match => match.matchday));
      }

      const nextRoundMatches = fixturesResponse.matches.filter(match => 
        match.matchday === nextMatchday && (match.status === 'SCHEDULED' || match.status === 'TIMED')
      );
      
      let matchesSynced = 0;
      let matchesUpdated = 0;
      const errors: string[] = [];

      // Step 3: Process each fixture from the next matchday
      for (const fixture of nextRoundMatches) {
        try {
          const existingMatch = await this.matchesRepository.findByExternalId(fixture.id.toString());
          
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
          errors.push(`Failed to process fixture ${fixture.id}: ${errorMessage}`);
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
    return new Match({
      id: MatchId.create(),
      externalId: fixture.id.toString(),
      homeTeamId: new TeamId(fixture.homeTeam.id.toString()),
      awayTeamId: new TeamId(fixture.awayTeam.id.toString()),
      kickoffTime: new DateTime(fixture.utcDate),
      status: this.mapApiStatusToMatchStatus(fixture.status),
      homeScore: fixture.score?.fullTime?.home || null,
      awayScore: fixture.score?.fullTime?.away || null,
      round: fixture.matchday,
      season
    });
  }

  private updateExistingMatch(match: Match, fixture: any): boolean {
    let updated = false;

    // Update status
    const newStatus = this.mapApiStatusToMatchStatus(fixture.status);
    if (!match.status.equals(newStatus)) {
      if (newStatus.isLive()) {
        match.markAsLive();
      } else if (newStatus.isFinished()) {
        match.markAsFinished();
      }
      updated = true;
    }

    // Update scores
    const newHomeScore = fixture.score?.fullTime?.home;
    const newAwayScore = fixture.score?.fullTime?.away;
    
    if (newHomeScore !== null && newAwayScore !== null) {
      if (match.homeScore !== newHomeScore || match.awayScore !== newAwayScore) {
        match.updateScore(newHomeScore, newAwayScore);
        updated = true;
      }
    }

    return updated;
  }

  private mapApiStatusToMatchStatus(apiStatus: string): MatchStatusVO {
    switch (apiStatus) {
      case 'SCHEDULED': // Not Started
      case 'TIMED': // Timed match
        return new MatchStatusVO(MatchStatus.SCHEDULED);
      case 'IN_PLAY': // First Half, Second Half
      case 'PAUSED': // Half Time
        return new MatchStatusVO(MatchStatus.LIVE);
      case 'FINISHED': // Full Time
        return new MatchStatusVO(MatchStatus.FINISHED);
      case 'SUSPENDED': // Suspended
      case 'POSTPONED': // Postponed
      case 'CANCELLED': // Cancelled
        return new MatchStatusVO(MatchStatus.POSTPONED);
      default:
        return new MatchStatusVO(MatchStatus.SCHEDULED);
    }
  }

}