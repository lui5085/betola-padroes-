import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@betola/core/shared/application/result';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';

interface StandingsTable {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

interface BrasileraoStandings {
  competition: {
    id: number;
    name: string;
    emblem: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  standings: StandingsTable[];
}

@Injectable()
export class GetBrasileraoStandingsUseCase {
  constructor(
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService,
  ) {}

  async execute(): Promise<Result<BrasileraoStandings>> {
    try {
      console.log('🏆 Fetching Brasileirão standings...');
      
      // FlashScore uses tournament IDs instead of numeric league+season.
      // The adapter handles the mapping internally, we pass the internal ID and season.
      const seasonId = parseInt(process.env.BRASILEIRAO_SEASON_ID || '185');
      const standingsResponse = await this.footballApiService.getStandings(71, seasonId);
      
      // Get the main standings table (usually the first one)
      const mainStandings = standingsResponse.standings.find(s => s.type === 'TOTAL');
      if (!mainStandings) {
        throw new Error('No main standings table found');
      }

      const standings: BrasileraoStandings = {
        competition: {
          id: standingsResponse.competition.id,
          name: standingsResponse.competition.name,
          emblem: standingsResponse.competition.emblem,
        },
        season: {
          id: standingsResponse.season.id,
          startDate: standingsResponse.season.startDate,
          endDate: standingsResponse.season.endDate,
          currentMatchday: standingsResponse.season.currentMatchday,
        },
        standings: mainStandings.table.map(entry => ({
          position: entry.position,
          team: {
            id: entry.team.id,
            name: entry.team.name,
            shortName: entry.team.shortName,
            tla: entry.team.tla,
            crest: entry.team.crest,
          },
          playedGames: entry.playedGames,
          won: entry.won,
          draw: entry.draw,
          lost: entry.lost,
          points: entry.points,
          goalsFor: entry.goalsFor,
          goalsAgainst: entry.goalsAgainst,
          goalDifference: entry.goalDifference,
          form: entry.form,
        })),
      };

      console.log(`✅ Found standings with ${standings.standings.length} teams`);
      
      return Result.success(standings);
    } catch (error) {
      console.error('❌ Error fetching Brasileirão standings:', error);
      return Result.failure(`Failed to fetch Brasileirão standings: ${error.message}`);
    }
  }
}