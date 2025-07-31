import { Result } from '../../../../shared/application/result';
import { FootballApiService } from '../../domain/services/football-api-service';
import { TeamsRepository } from '../../domain/repositories/teams-repository';
import { Team } from '../../domain/entities/team';
import { TeamId } from '../../domain/value-objects/team-id';

export interface SyncTeamsRequest {
  season?: number;
  forceRefresh?: boolean;
}

export interface SyncTeamsResponse {
  teamsSynced: number;
  teamsUpdated: number;
  errors: string[];
}

export class SyncTeamsUseCase {
  constructor(
    private readonly footballApiService: FootballApiService,
    private readonly teamsRepository: TeamsRepository
  ) {}

  async execute(request: SyncTeamsRequest = {}): Promise<Result<SyncTeamsResponse>> {
    try {
      // Get Brasileirao league data first
      const leagueResponse = await this.footballApiService.getBrasileirao();
      
      if (!leagueResponse.id) {
        return Result.failure('Brasileirao league not found');
      }

      const league = leagueResponse;
      const currentSeason = league.seasons.find(s => s.id === 2257);
      
      if (!currentSeason) {
        return Result.failure('Current Brasileirao season not found');
      }

      const leagueId = league.id;
      const season = request.season || 2024;

      // Get teams for the league
      const teamsResponse = await this.footballApiService.getTeams(leagueId, season);
      
      if (!teamsResponse.teams?.length) {
        return Result.failure('No teams found for Brasileirao');
      }

      let teamsSynced = 0;
      let teamsUpdated = 0;
      const errors: string[] = [];

      for (const teamData of teamsResponse.teams) {
        try {
          const existingTeam = await this.teamsRepository.findByExternalId(teamData.id.toString());
          
          if (existingTeam) {
            // Update existing team if needed
            const updated = this.updateTeamData(existingTeam, teamData);
            if (updated) {
              await this.teamsRepository.save(existingTeam);
              teamsUpdated++;
            }
          } else {
            // Create new team
            const newTeam = this.createTeamFromApiData(teamData);
            await this.teamsRepository.save(newTeam);
            teamsSynced++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to process team ${teamData.name}: ${errorMessage}`);
        }
      }

      return Result.success({
        teamsSynced,
        teamsUpdated,
        errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to sync teams: ${errorMessage}`);
    }
  }

  private createTeamFromApiData(teamData: any): Team {
    return new Team({
      id: TeamId.create(),
      externalId: teamData.id.toString(),
      name: teamData.name,
      shortName: teamData.shortName || teamData.tla || teamData.name.substring(0, 3).toUpperCase(),
      logoUrl: teamData.crest,
      founded: teamData.founded,
      country: 'Brazil', // Since this is specifically for Brasileirao
      venue: teamData.venue ? {
        name: teamData.venue,
        city: teamData.venue, // The API only provides venue name
        capacity: null // Not available in this API structure
      } : undefined
    });
  }

  private updateTeamData(team: Team, teamData: any): boolean {
    let updated = false;

    // Update logo if different
    if (team.logoUrl !== teamData.crest) {
      team.updateLogo(teamData.crest);
      updated = true;
    }

    // Update venue if different
    const newVenue = teamData.venue ? {
      name: teamData.venue,
      city: teamData.venue, // The API only provides venue name
      capacity: null // Not available in this API structure
    } : undefined;

    if (JSON.stringify(team.venue) !== JSON.stringify(newVenue)) {
      team.updateVenue(newVenue);
      updated = true;
    }

    return updated;
  }
}