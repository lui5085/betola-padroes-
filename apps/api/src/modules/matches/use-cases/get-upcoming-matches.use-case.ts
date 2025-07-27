import { Injectable, Inject } from '@nestjs/common';
import { MatchesRepository, MatchId } from '@betola/core';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';

export interface GetUpcomingMatchesRequest {
  limit?: number;
  status?: string;
  matchId?: string;
}

@Injectable()
export class GetUpcomingMatchesUseCase {
  constructor(
    @Inject('MatchesRepository')
    private readonly matchesRepository: MatchesRepository,
    @Inject('FootballApiService')
    private readonly footballApiService: FootballApiService
  ) {}

  async execute(request: GetUpcomingMatchesRequest): Promise<{ value: any[] }> {
    try {
      if (request.matchId) {
        const match = await this.matchesRepository.findById(new MatchId(request.matchId));
        return {
          value: match ? [this.formatMatch(match)] : []
        };
      }
      
      const matches = await this.matchesRepository.findUpcoming(request.limit || 20);
      
      // Always try to fetch from API first for testing
      console.log('Attempting to fetch from API...');
      try {
        const apiData = await this.fetchFromApi(request.limit || 20);
        console.log('API fetch successful, got', apiData.length, 'matches');
        if (apiData.length > 0) {
          return { value: apiData };
        }
      } catch (error) {
        console.error('Failed to fetch from API, using mock data:', error.message);
        console.error('Full error:', error);
      }
      
      // If no matches found, return mock data for testing
      if (matches.length === 0) {
        console.log('No database matches found, returning mock data');
        return {
          value: this.getMockMatches().slice(0, request.limit || 20)
        };
      }
      
      return {
        value: matches.map(match => this.formatMatch(match))
      };
    } catch (error) {
      // Return mock data as fallback
      if (request.matchId) {
        return {
          value: this.getMockMatches().filter(m => m.id === request.matchId)
        };
      }
      
      return {
        value: this.getMockMatches().slice(0, request.limit || 20)
      };
    }
  }

  private formatMatch(match: any): any {
    return {
      id: match.id?.value || match.id,
      homeTeam: {
        id: match.homeTeamId?.value || match.homeTeamId,
        name: match.homeTeam?.name || 'Time A',
        shortName: match.homeTeam?.shortName || 'TA'
      },
      awayTeam: {
        id: match.awayTeamId?.value || match.awayTeamId,
        name: match.awayTeam?.name || 'Time B',
        shortName: match.awayTeam?.shortName || 'TB'
      },
      kickoffTime: match.kickoffTime?.value || match.kickoffTime,
      status: match.status?.value || match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      round: match.round,
      season: match.season
    };
  }

  private getMockMatches(): any[] {
    const now = Date.now();
    return [
      {
        id: '1',
        homeTeam: { id: '1', name: 'Flamengo', shortName: 'FLA' },
        awayTeam: { id: '2', name: 'Palmeiras', shortName: 'PAL' },
        kickoffTime: new Date(now + 86400000).toISOString(),
        status: 'SCHEDULED',
        round: 1,
        season: '2024'
      },
      {
        id: '2',
        homeTeam: { id: '3', name: 'São Paulo', shortName: 'SPO' },
        awayTeam: { id: '4', name: 'Corinthians', shortName: 'COR' },
        kickoffTime: new Date(now + 172800000).toISOString(),
        status: 'SCHEDULED',
        round: 1,
        season: '2024'
      },
      {
        id: '3',
        homeTeam: { id: '5', name: 'Santos', shortName: 'SAN' },
        awayTeam: { id: '6', name: 'Botafogo', shortName: 'BOT' },
        kickoffTime: new Date(now + 259200000).toISOString(),
        status: 'SCHEDULED',
        round: 1,
        season: '2024'
      }
    ];
  }

  private async fetchFromApi(limit: number): Promise<any[]> {
    try {
      // Get Brasileirao league
      const leagueResult = await this.footballApiService.getBrasileirao();
      
      if (!leagueResult.response || leagueResult.response.length === 0) {
        throw new Error('No league data returned');
      }

      const league = leagueResult.response[0];
      // Use 2023 season as it has complete data
      const currentSeason = 2023;
      
      // Get fixtures for current season
      const fixturesResult = await this.footballApiService.getFixtures(
        league.league.id, 
        currentSeason
      );

      if (!fixturesResult.response || fixturesResult.response.length === 0) {
        throw new Error('No fixtures data returned');
      }

      // Get some fixtures and adjust dates to be future for demo
      const selectedFixtures = fixturesResult.response
        .filter(fixture => fixture.fixture.status.short === 'FT') // Get finished matches
        .slice(0, limit);

      return selectedFixtures.map((fixture, index) => {
        // Create future dates for demo purposes
        const baseDate = new Date();
        const futureDate = new Date(baseDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
        
        return {
        id: fixture.fixture.id.toString(),
        homeTeam: {
          id: fixture.teams.home.id.toString(),
          name: fixture.teams.home.name,
          shortName: this.getShortName(fixture.teams.home.name),
          logoUrl: fixture.teams.home.logo
        },
        awayTeam: {
          id: fixture.teams.away.id.toString(),
          name: fixture.teams.away.name,
          shortName: this.getShortName(fixture.teams.away.name),
          logoUrl: fixture.teams.away.logo
        },
        kickoffTime: futureDate.toISOString(),
        status: 'SCHEDULED',
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        round: this.extractRound(fixture.league.round),
        season: fixture.league.season.toString()
        };
      });
    } catch (error) {
      console.error('Error fetching from Football API:', error);
      throw error;
    }
  }

  private getShortName(teamName: string): string {
    const shortNames: Record<string, string> = {
      'Flamengo': 'FLA',
      'Palmeiras': 'PAL',
      'São Paulo': 'SPO',
      'Atlético Mineiro': 'CAM',
      'Botafogo': 'BOT',
      'Fluminense': 'FLU',
      'Internacional': 'INT',
      'Grêmio': 'GRE',
      'Corinthians': 'COR',
      'Santos': 'SAN',
      'Bahia': 'BAH',
      'Fortaleza': 'FOR',
      'Cruzeiro': 'CRU',
      'Vasco da Gama': 'VAS',
      'Sport Recife': 'SPT',
      'Ceará': 'CEA',
      'Juventude': 'JUV',
      'Red Bull Bragantino': 'RBB',
      'Vitória': 'VIT',
      'Mirassol': 'MIR'
    };
    
    return shortNames[teamName] || teamName.substring(0, 3).toUpperCase();
  }

  private extractRound(roundString: string): number {
    const match = roundString.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }
}