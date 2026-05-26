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
      
      // Always try to fetch from external API first
      console.log('Fetching matches from external Football API...');
      try {
        const apiData = await this.fetchFromApiWithRetry(request.limit || 20);
        console.log('✅ Successfully fetched', apiData.length, 'matches from external API');
        return { value: apiData };
      } catch (error) {
        console.error('❌ Failed to fetch from external API:', error.message);
        // Log more details for debugging
        console.error('API Error details:', {
          message: error.message,
          name: error.name,
          config: {
            baseUrl: process.env.FLASHSCORE_BASE_URL,
            hasApiKey: !!process.env.FLASHSCORE_API_KEY
          }
        });
        throw new Error(`External API unavailable: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Complete failure in matches use case:', error.message);
      throw error;
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

  private getEnhancedMockMatches(): any[] {
    const now = Date.now();
    const teams = [
      { id: '1', name: 'CR Flamengo', shortName: 'FLA' },
      { id: '2', name: 'SE Palmeiras', shortName: 'PAL' },
      { id: '3', name: 'São Paulo FC', shortName: 'SAO' },
      { id: '4', name: 'SC Corinthians', shortName: 'COR' },
      { id: '5', name: 'Santos FC', shortName: 'SAN' },
      { id: '6', name: 'Botafogo FR', shortName: 'BOT' },
      { id: '7', name: 'Fluminense FC', shortName: 'FLU' },
      { id: '8', name: 'Atlético Mineiro', shortName: 'CAM' },
      { id: '9', name: 'SC Internacional', shortName: 'INT' },
      { id: '10', name: 'Grêmio FBPA', shortName: 'GRE' },
      { id: '11', name: 'Bahia', shortName: 'BAH' },
      { id: '12', name: 'Fortaleza EC', shortName: 'FOR' },
      { id: '13', name: 'Cruzeiro', shortName: 'CRU' },
      { id: '14', name: 'Vasco da Gama', shortName: 'VAS' },
      { id: '15', name: 'Athletico PR', shortName: 'CAP' },
      { id: '16', name: 'Red Bull Bragantino', shortName: 'RBB' }
    ];

    const matches = [];
    let currentDate = now + 86400000; // Start tomorrow
    
    // Generate 20 realistic matches over the next 2 weeks
    for (let i = 0; i < 20; i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam;
      do {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      } while (awayTeam.id === homeTeam.id);

      // Spread matches over 2 weeks with realistic scheduling
      const daysOffset = Math.floor(i / 3); // ~3 matches per day
      const hoursOffset = (i % 3) * 4 + 19; // Start at 19h, then 23h, then 3h next day
      const matchDate = new Date(now + (daysOffset * 86400000) + (hoursOffset * 3600000));

      matches.push({
        id: (i + 1).toString(),
        homeTeam,
        awayTeam,
        kickoffTime: matchDate.toISOString(),
        status: 'SCHEDULED',
        round: Math.floor(i / 10) + 20, // Round 20, 21
        season: '2025'
      });
    }

    // Add a few live/finished matches for variety
    matches.push(
      {
        id: '21',
        homeTeam: teams[0], // Flamengo
        awayTeam: teams[1], // Palmeiras
        kickoffTime: new Date(now - 7200000).toISOString(), // 2 hours ago
        status: 'LIVE',
        homeScore: 1,
        awayScore: 1,
        round: 19,
        season: '2025'
      },
      {
        id: '22',
        homeTeam: teams[2], // São Paulo
        awayTeam: teams[3], // Corinthians
        kickoffTime: new Date(now - 86400000).toISOString(), // Yesterday
        status: 'FINISHED',
        homeScore: 2,
        awayScore: 1,
        round: 19,
        season: '2025'
      }
    );

    return matches;
  }

  private async fetchFromApiWithRetry(limit: number, maxRetries: number = 3): Promise<any[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 API attempt ${attempt}/${maxRetries}`);
        
        // Add delay between retries (exponential backoff)
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 2s, 4s, 8s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await this.fetchFromApi(limit);
        console.log(`✅ API call successful on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.log(`❌ API attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    throw new Error('All retry attempts exhausted');
  }

  private async fetchFromApi(limit: number): Promise<any[]> {
    try {
      console.log('📡 Requesting Brasileirao league info...');
      // Get Brasileirao league info
      const leagueResult = await this.footballApiService.getBrasileirao();
      
      if (!leagueResult.id) {
        throw new Error('No league data returned from getBrasileirao()');
      }

      console.log(`📊 League found: ${leagueResult.name} (ID: ${leagueResult.id})`);

      // Use the season ID from FlashScore (185 for current Brasileirão)
      const currentSeason = leagueResult.currentSeason?.id || 185;
      
      console.log(`📅 Fetching fixtures for season ${currentSeason}...`);
      // Get fixtures for current season
      const fixturesResult = await this.footballApiService.getFixtures(
        leagueResult.id, 
        currentSeason
      );

      if (!fixturesResult.matches || fixturesResult.matches.length === 0) {
        throw new Error('No fixtures data available from FlashScore API');
      }

      console.log(`📊 Found ${fixturesResult.matches.length} matches in season ${currentSeason}`);
      return this.processFixtures(fixturesResult.matches, limit, currentSeason);
    } catch (error) {
      console.error('💥 Error in fetchFromApi:', error.message);
      throw error;
    }
  }

  private processFixtures(matches: any[], limit: number, season: number): any[] {
    console.log(`🔍 Processing ${matches.length} fixtures...`);
    
    // FlashScore fixtures endpoint returns upcoming matches.
    // They all have status 'TIMED' since they come from the fixtures (upcoming) endpoint.
    const now = new Date();
    const upcomingMatches = matches.filter(match => {
      const matchDate = new Date(match.utcDate);
      // Accept all matches with TIMED/SCHEDULED status, or future dates
      return matchDate > now || match.status === 'TIMED' || match.status === 'SCHEDULED';
    });
    
    if (upcomingMatches.length === 0) {
      console.log('⚠️ No upcoming matches found, showing all available fixtures...');
      // Show whatever we have
      const availableMatches = matches.slice(0, limit);
      console.log(`📅 Showing ${availableMatches.length} available matches`);
      return this.formatUpcomingFixtures(availableMatches, season);
    }

    // Sort by date
    upcomingMatches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

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
    
    console.log('🔍 Analyzing available matchdays:');
    for (const [matchday, mdMatches] of matchdayGroups.entries()) {
      console.log(`  Matchday ${matchday}: ${mdMatches.length} matches`);
      
      if (mdMatches.length > maxMatches && mdMatches.length >= 5) { // At least 5 matches in a round
        maxMatches = mdMatches.length;
        nextMatchday = matchday;
      }
    }

    // If no good round found, fall back to the earliest matchday
    if (!nextMatchday) {
      nextMatchday = Math.min(...upcomingMatches.map(match => match.matchday));
      console.log('⚠️ No complete round found, using earliest matchday:', nextMatchday);
    } else {
      console.log('✅ Best matchday found:', nextMatchday, 'with', maxMatches, 'matches');
    }

    const nextRoundMatches = matches.filter(match => 
      match.matchday === nextMatchday
    ).slice(0, limit);
    
    console.log(`📅 Found ${nextRoundMatches.length} matches for next round (matchday ${nextMatchday})`);
    return this.formatUpcomingFixtures(nextRoundMatches, season);
  }

  private formatUpcomingFixtures(upcomingFixtures: any[], season: number): any[] {
    console.log(`📅 Formatting ${upcomingFixtures.length} upcoming matches`);

    return upcomingFixtures.map(match => 
      this.formatNewApiMatch(match, new Date(match.utcDate), this.mapNewApiStatus(match.status))
    );
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

  private formatApiFixture(fixture: any, date: Date, status: string): any {
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
      kickoffTime: date.toISOString(),
      status: status,
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
      round: this.extractRound(fixture.league.round),
      season: fixture.league.season.toString()
    };
  }

  private mapApiStatus(apiStatus: string): string {
    const statusMap: Record<string, string> = {
      'NS': 'SCHEDULED',    // Not Started
      'TBD': 'SCHEDULED',   // To Be Determined
      '1H': 'LIVE',         // First Half
      '2H': 'LIVE',         // Second Half
      'HT': 'LIVE',         // Half Time
      'FT': 'FINISHED',     // Full Time
      'AET': 'FINISHED',    // After Extra Time
      'PEN': 'FINISHED',    // Penalty Shootout
      'PST': 'POSTPONED',   // Postponed
      'CANC': 'CANCELLED',  // Cancelled
      'ABD': 'CANCELLED',   // Abandoned
      'AWD': 'FINISHED',    // Awarded
      'WO': 'FINISHED'      // Walkover
    };
    
    return statusMap[apiStatus] || 'SCHEDULED';
  }

  private formatNewApiMatch(match: any, date: Date, status: string): any {
    return {
      id: match.id.toString(),
      homeTeam: {
        id: match.homeTeam.id.toString(),
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName || match.homeTeam.tla,
        logoUrl: match.homeTeam.crest
      },
      awayTeam: {
        id: match.awayTeam.id.toString(),
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName || match.awayTeam.tla,
        logoUrl: match.awayTeam.crest
      },
      kickoffTime: date.toISOString(),
      status: status,
      homeScore: match.score?.fullTime?.home || null,
      awayScore: match.score?.fullTime?.away || null,
      round: match.matchday,
      season: match.season?.id?.toString() || '2024'
    };
  }

  private mapNewApiStatus(apiStatus: string): string {
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'SCHEDULED',
      'LIVE': 'LIVE',
      'IN_PLAY': 'LIVE',
      'PAUSED': 'LIVE',
      'FINISHED': 'FINISHED',
      'POSTPONED': 'POSTPONED',
      'SUSPENDED': 'POSTPONED',
      'CANCELLED': 'CANCELLED'
    };
    
    return statusMap[apiStatus] || 'SCHEDULED';
  }
}