import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@betola/core/shared/application/result';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';

interface BrasileraoTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  founded: number;
  venue: string;
  website: string;
}

@Injectable()
export class GetBrasileraoTeamsUseCase {
  constructor(
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService,
  ) {}

  async execute(): Promise<Result<BrasileraoTeam[]>> {
    try {
      console.log('🏈 Fetching Brasileirão teams...');
      
      // FlashScore uses tournament IDs instead of numeric league+season.
      // The adapter handles the mapping internally, we pass the internal ID and season.
      const seasonId = parseInt(process.env.BRASILEIRAO_SEASON_ID || '185');
      const teamsResponse = await this.footballApiService.getTeams(71, seasonId);
      
      const teams: BrasileraoTeam[] = teamsResponse.teams.map(team => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        crest: team.crest,
        founded: team.founded,
        venue: team.venue,
        website: team.website,
      }));

      console.log(`✅ Found ${teams.length} Brasileirão teams`);
      
      return Result.success(teams);
    } catch (error) {
      console.error('❌ Error fetching Brasileirão teams:', error);
      return Result.failure(`Failed to fetch Brasileirão teams: ${error.message}`);
    }
  }
}