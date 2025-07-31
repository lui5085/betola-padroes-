import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@betola/core/shared/application/result';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';

interface TeamDetails {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  coach: {
    id: number;
    name: string;
    nationality: string;
  } | null;
  squad: {
    id: number;
    name: string;
    position: string;
    nationality: string;
  }[];
}

@Injectable()
export class GetTeamDetailsUseCase {
  constructor(
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService,
  ) {}

  async execute(teamId: number): Promise<Result<TeamDetails>> {
    try {
      console.log(`🏈 Fetching team details for ID: ${teamId}`);
      
      const teamResponse = await this.footballApiService.getTeam(teamId);
      
      const teamDetails: TeamDetails = {
        id: teamResponse.id,
        name: teamResponse.name,
        shortName: teamResponse.shortName,
        tla: teamResponse.tla,
        crest: teamResponse.crest,
        address: teamResponse.address,
        website: teamResponse.website,
        founded: teamResponse.founded,
        clubColors: teamResponse.clubColors,
        venue: teamResponse.venue,
        coach: teamResponse.coach ? {
          id: teamResponse.coach.id,
          name: teamResponse.coach.name,
          nationality: teamResponse.coach.nationality,
        } : null,
        squad: teamResponse.squad.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          nationality: player.nationality,
        })),
      };

      console.log(`✅ Found team details for: ${teamDetails.name}`);
      
      return Result.success(teamDetails);
    } catch (error) {
      console.error(`❌ Error fetching team details for ID ${teamId}:`, error);
      return Result.failure(`Failed to fetch team details: ${error.message}`);
    }
  }
}