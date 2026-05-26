import { 
  FootballApiService, 
  FootballApiConfig,
  FootballApiLeagueResponse,
  FootballApiStandingsResponse,
  FootballApiFixturesResponse,
  FootballApiOddsResponse,
  FootballApiRoundsResponse,
  FootballApiTeamsResponse,
  FootballApiTeamResponse
} from '@betola/core/modules/matches/domain/services/football-api-service';

// Brasileirão Serie A IDs in FlashScore4 API
const BRASILEIRAO_TOURNAMENT_TEMPLATE_ID = process.env.BRASILEIRAO_TOURNAMENT_TEMPLATE_ID || 'Yq4hUnzQ';
const BRASILEIRAO_TOURNAMENT_ID = process.env.BRASILEIRAO_TOURNAMENT_ID || 'pv7V3RRE';
const BRASILEIRAO_TOURNAMENT_STAGE_ID = process.env.BRASILEIRAO_TOURNAMENT_STAGE_ID || 'hdLUdQGi';
const BRASILEIRAO_SEASON_ID = process.env.BRASILEIRAO_SEASON_ID || '185';

// Internal league ID used for domain compatibility (arbitrary stable number)
const BRASILEIRAO_INTERNAL_ID = 71;

export class FootballApiClient implements FootballApiService {
  private readonly config: FootballApiConfig;
  private readonly cache = new Map<string, { data: any; expiry: number }>();
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // 1 second between requests
  private teamsCache = new Map<string, any>();

  constructor(config: FootballApiConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, cacheTtl?: number): Promise<T> {
    const cacheKey = endpoint;
    
    // Check cache first
    if (cacheTtl) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        console.log('🎯 Cache hit for:', endpoint);
        return cached.data;
      }
    }

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`⏱️  Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();

    const url = `${this.config.baseUrl}${endpoint}`;
    
    console.log('🌐 Making FlashScore API request:', {
      url,
      method: 'GET',
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.config.apiKey,
        'x-rapidapi-host': 'flashscore4.p.rapidapi.com',
        'Accept': 'application/json',
      }
    });

    console.log('📡 FlashScore API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorBody = 'No body';
      try {
        errorBody = await response.text();
        console.log('❌ Error response body:', errorBody);
      } catch (e) {
        console.log('❌ Could not read error response body');
      }
      
      throw new Error(`FlashScore API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();

    // Cache the result
    if (cacheTtl) {
      this.cache.set(cacheKey, {
        data,
        expiry: Date.now() + cacheTtl * 1000
      });
      console.log(`💾 Cached result for ${cacheTtl}s:`, endpoint);
    }

    return data;
  }

  // ===== Adapter methods that convert FlashScore4 responses to our domain interfaces =====

  async getBrasileirao(): Promise<FootballApiLeagueResponse> {
    // FlashScore doesn't have a direct "league info" endpoint like API-Football.
    // We return hardcoded league info since we know the Brasileirão IDs.
    return {
      id: BRASILEIRAO_INTERNAL_ID,
      name: 'Brasileirão Serie A',
      code: 'BSA',
      type: 'League',
      emblem: '',
      area: {
        id: 76,
        name: 'Brazil',
        code: 'BR',
        flag: '',
      },
      currentSeason: {
        id: parseInt(BRASILEIRAO_SEASON_ID),
        startDate: '2025-03-29',
        endDate: '2025-12-07',
        currentMatchday: 1,
        winner: null,
      },
      seasons: [{
        id: parseInt(BRASILEIRAO_SEASON_ID),
        startDate: '2025-03-29',
        endDate: '2025-12-07',
        currentMatchday: 1,
        winner: null,
      }],
    };
  }

  async getCurrentRound(_leagueId: number, _season: number): Promise<FootballApiRoundsResponse> {
    // FlashScore doesn't have a direct "current round" endpoint.
    // We derive it from standings or fixtures data.
    try {
      const standings = await this.getStandings(_leagueId, _season);
      const currentMatchday = standings.season.currentMatchday || 1;
      return {
        response: [`Regular Season - ${currentMatchday}`],
      };
    } catch {
      return { response: ['Regular Season - 1'] };
    }
  }

  async getStandings(_leagueId: number, _season: number): Promise<FootballApiStandingsResponse> {
    const raw = await this.request<any>(
      `/tournaments/standings?tournament_id=${BRASILEIRAO_TOURNAMENT_ID}&tournament_stage_id=${BRASILEIRAO_TOURNAMENT_STAGE_ID}&type=overall`,
      this.config.cacheTtl.standings
    );

    // FlashScore standings response: { data: [ { team_id, team_name, ... } ] } or similar
    const rows = raw?.data || raw?.standings || raw || [];
    const standingsData = Array.isArray(rows) ? rows : [];

    // Determine current matchday from max played games
    const maxPlayed = standingsData.reduce((max: number, entry: any) => {
      const played = entry.matches_total || entry.played || entry.games_played || 0;
      return Math.max(max, played);
    }, 0);

    return {
      filters: {},
      area: {
        id: 76,
        name: 'Brazil',
        code: 'BR',
        flag: '',
      },
      competition: {
        id: BRASILEIRAO_INTERNAL_ID,
        name: 'Brasileirão Serie A',
        code: 'BSA',
        type: 'League',
        emblem: '',
      },
      season: {
        id: parseInt(BRASILEIRAO_SEASON_ID),
        startDate: '2025-03-29',
        endDate: '2025-12-07',
        currentMatchday: maxPlayed,
        winner: null,
      },
      standings: [{
        stage: 'REGULAR_SEASON',
        type: 'TOTAL',
        group: null,
        table: standingsData.map((entry: any, index: number) => {
          const teamId = entry.team_id || entry.id || `team_${index}`;
          const teamName = entry.team_name || entry.name || `Team ${index + 1}`;
          
          // Cache team info for later use
          this.teamsCache.set(String(teamId), {
            id: teamId,
            name: teamName,
            shortName: entry.short_name || teamName,
            crest: entry.small_image_path || entry.logo || '',
          });

          return {
            position: entry.rank || entry.position || index + 1,
            team: {
              id: this.hashStringToNumber(String(teamId)),
              name: teamName,
              shortName: entry.short_name || teamName,
              tla: (entry.short_name || teamName).substring(0, 3).toUpperCase(),
              crest: entry.small_image_path || entry.logo || '',
            },
            playedGames: entry.matches_total || entry.played || entry.games_played || 0,
            form: entry.form || '',
            won: entry.wins || entry.won || 0,
            draw: entry.draws || entry.draw || 0,
            lost: entry.losses || entry.lost || 0,
            points: entry.points || 0,
            goalsFor: entry.goals_scored || entry.goals_for || entry.goalsFor || 0,
            goalsAgainst: entry.goals_conceded || entry.goals_against || entry.goalsAgainst || 0,
            goalDifference: entry.goal_diff || entry.goal_difference || 
              ((entry.goals_scored || 0) - (entry.goals_conceded || 0)),
          };
        }),
      }],
    };
  }

  async getFixtures(_leagueId: number, _season: number, _round?: string): Promise<FootballApiFixturesResponse> {
    // Fetch upcoming fixtures from FlashScore
    let allFixtures: any[] = [];
    
    // Fetch first page of fixtures
    const raw = await this.request<any>(
      `/tournaments/fixtures?tournament_template_id=${BRASILEIRAO_TOURNAMENT_TEMPLATE_ID}&season_id=${BRASILEIRAO_SEASON_ID}&page=1`,
      this.config.cacheTtl.fixtures
    );

    const fixtures = raw?.data || raw?.fixtures || raw || [];
    if (Array.isArray(fixtures)) {
      allFixtures = fixtures;
    }

    // Map FlashScore fixtures to our domain format
    return {
      filters: {},
      resultSet: {
        count: allFixtures.length,
        first: allFixtures.length > 0 ? this.timestampToIso(allFixtures[0]?.timestamp) : '',
        last: allFixtures.length > 0 ? this.timestampToIso(allFixtures[allFixtures.length - 1]?.timestamp) : '',
        played: 0,
      },
      competition: {
        id: BRASILEIRAO_INTERNAL_ID,
        name: 'Brasileirão Serie A',
        code: 'BSA',
        type: 'League',
        emblem: '',
      },
      matches: allFixtures.map((f: any, index: number) => {
        const matchId = f.match_id || f.id || `match_${index}`;
        const timestamp = f.timestamp;
        const utcDate = this.timestampToIso(timestamp);
        const homeTeam = f.home_team || {};
        const awayTeam = f.away_team || {};
        const round = f.round || f.matchday || index + 1;

        // Cache teams
        if (homeTeam.team_id) {
          this.teamsCache.set(String(homeTeam.team_id), homeTeam);
        }
        if (awayTeam.team_id) {
          this.teamsCache.set(String(awayTeam.team_id), awayTeam);
        }

        return {
          area: { id: 76, name: 'Brazil', code: 'BR', flag: '' },
          competition: { id: BRASILEIRAO_INTERNAL_ID, name: 'Brasileirão Serie A', code: 'BSA', type: 'League', emblem: '' },
          season: { id: parseInt(BRASILEIRAO_SEASON_ID), startDate: '', endDate: '', currentMatchday: 0, winner: null },
          id: this.hashStringToNumber(String(matchId)),
          utcDate,
          status: 'TIMED', // Fixtures endpoint returns upcoming matches
          matchday: typeof round === 'number' ? round : this.extractMatchday(round),
          stage: 'REGULAR_SEASON',
          group: null,
          lastUpdated: utcDate,
          homeTeam: {
            id: this.hashStringToNumber(String(homeTeam.team_id || `home_${index}`)),
            name: homeTeam.name || 'TBD',
            shortName: homeTeam.short_name || homeTeam.name || 'TBD',
            tla: (homeTeam.short_name || homeTeam.name || 'TBD').substring(0, 3).toUpperCase(),
            crest: homeTeam.small_image_path || homeTeam.logo || '',
          },
          awayTeam: {
            id: this.hashStringToNumber(String(awayTeam.team_id || `away_${index}`)),
            name: awayTeam.name || 'TBD',
            shortName: awayTeam.short_name || awayTeam.name || 'TBD',
            tla: (awayTeam.short_name || awayTeam.name || 'TBD').substring(0, 3).toUpperCase(),
            crest: awayTeam.small_image_path || awayTeam.logo || '',
          },
          score: null,
          odds: { msg: '' },
          referees: [],
        };
      }),
    };
  }

  async getTeams(_leagueId: number, _season: number): Promise<FootballApiTeamsResponse> {
    // FlashScore doesn't have a dedicated teams endpoint for a league.
    // We extract teams from standings data.
    const standings = await this.getStandings(_leagueId, _season);
    const teamsFromStandings = standings.standings[0]?.table || [];

    return {
      count: teamsFromStandings.length,
      filters: {},
      competition: { id: BRASILEIRAO_INTERNAL_ID, name: 'Brasileirão Serie A', code: 'BSA', type: 'League', emblem: '' },
      season: { id: parseInt(BRASILEIRAO_SEASON_ID), startDate: '', endDate: '', currentMatchday: 0, winner: null },
      teams: teamsFromStandings.map((entry: any) => ({
        id: entry.team.id,
        name: entry.team.name,
        shortName: entry.team.shortName,
        tla: entry.team.tla,
        crest: entry.team.crest,
        address: '',
        website: '',
        founded: 0,
        clubColors: '',
        venue: '',
        runningCompetitions: [],
        coach: { id: 0, firstName: '', lastName: '', name: '', dateOfBirth: '', nationality: '' },
        squad: [],
        staff: [],
        lastUpdated: '',
      })),
    };
  }

  async getTeam(teamId: number): Promise<FootballApiTeamResponse> {
    // Try to find team in cache first
    const cachedTeam = Array.from(this.teamsCache.values()).find(
      t => this.hashStringToNumber(String(t.team_id || t.id)) === teamId
    );

    if (cachedTeam) {
      return {
        id: teamId,
        name: cachedTeam.name || '',
        shortName: cachedTeam.short_name || cachedTeam.name || '',
        tla: (cachedTeam.short_name || cachedTeam.name || '').substring(0, 3).toUpperCase(),
        crest: cachedTeam.small_image_path || cachedTeam.logo || cachedTeam.crest || '',
        address: '',
        website: '',
        founded: 0,
        clubColors: '',
        venue: '',
        runningCompetitions: [],
        coach: { id: 0, firstName: '', lastName: '', name: '', dateOfBirth: '', nationality: '' },
        squad: [],
        staff: [],
        lastUpdated: '',
      };
    }

    // If not in cache, populate cache from standings and try again
    await this.getStandings(BRASILEIRAO_INTERNAL_ID, parseInt(BRASILEIRAO_SEASON_ID));
    
    const teamFromCache = Array.from(this.teamsCache.values()).find(
      t => this.hashStringToNumber(String(t.team_id || t.id)) === teamId
    );

    return {
      id: teamId,
      name: teamFromCache?.name || '',
      shortName: teamFromCache?.short_name || teamFromCache?.shortName || teamFromCache?.name || '',
      tla: (teamFromCache?.short_name || teamFromCache?.name || '').substring(0, 3).toUpperCase(),
      crest: teamFromCache?.small_image_path || teamFromCache?.logo || teamFromCache?.crest || '',
      address: '',
      website: '',
      founded: 0,
      clubColors: '',
      venue: '',
      runningCompetitions: [],
      coach: { id: 0, firstName: '', lastName: '', name: '', dateOfBirth: '', nationality: '' },
      squad: [],
      staff: [],
      lastUpdated: '',
    };
  }

  async getOdds(fixtureId: number): Promise<FootballApiOddsResponse> {
    // We need to find the original FlashScore match_id from our hashed numeric ID.
    // For odds, we'll try to find the match_id from cache or use the numeric ID as string.
    const matchIdStr = this.findOriginalMatchId(fixtureId);
    
    if (!matchIdStr) {
      console.log('⚠️ Could not find original match_id for fixture:', fixtureId);
      return { response: [] };
    }

    const raw = await this.request<any>(
      `/matches/odds?match_id=${matchIdStr}&geo_ip_code=BR`,
      1800
    );

    // Map FlashScore odds to our domain format
    const oddsData = raw?.data || raw?.odds || raw || [];
    const bookmakers = Array.isArray(oddsData) ? oddsData : [];

    return {
      response: bookmakers.length > 0 ? [{
        league: {
          id: BRASILEIRAO_INTERNAL_ID,
          name: 'Brasileirão Serie A',
          country: 'Brazil',
          logo: '',
          flag: '',
          season: parseInt(BRASILEIRAO_SEASON_ID),
        },
        fixture: {
          id: fixtureId,
          timezone: 'America/Sao_Paulo',
          date: '',
          timestamp: 0,
        },
        update: new Date().toISOString(),
        bookmakers: bookmakers.map((bm: any) => ({
          id: bm.bookmaker_id || 0,
          name: bm.bookmaker_name || bm.name || 'Unknown',
          bets: (bm.markets || bm.bets || []).map((market: any) => ({
            id: market.market_id || market.id || 0,
            name: market.market_name || market.name || 'Match Winner',
            values: (market.outcomes || market.values || []).map((outcome: any) => ({
              value: outcome.name || outcome.value || '',
              odd: String(outcome.odds || outcome.odd || '0'),
            })),
          })),
        })),
      }] : [],
    };
  }

  async getLiveMatches(_leagueId: number): Promise<FootballApiFixturesResponse> {
    const raw = await this.request<any>(
      `/matches/live?sport_id=1&timezone=America/Sao_Paulo`,
      this.config.cacheTtl.liveMatches
    );

    const liveMatches = raw?.data || raw?.matches || raw || [];
    const allLive = Array.isArray(liveMatches) ? liveMatches : [];

    // Filter for Brasileirão matches only
    const brasileiraoLive = allLive.filter((m: any) => {
      const tournamentId = m.tournament_id || m.tournament?.id || '';
      const tournamentName = m.tournament_name || m.tournament?.name || '';
      return (
        tournamentId === BRASILEIRAO_TOURNAMENT_ID ||
        tournamentName.toLowerCase().includes('serie a') ||
        tournamentName.toLowerCase().includes('brasileir')
      );
    });

    return {
      filters: {},
      resultSet: { count: brasileiraoLive.length, first: '', last: '', played: 0 },
      competition: { id: BRASILEIRAO_INTERNAL_ID, name: 'Brasileirão Serie A', code: 'BSA', type: 'League', emblem: '' },
      matches: brasileiraoLive.map((f: any, index: number) => {
        const matchId = f.match_id || f.id || `live_${index}`;
        const homeTeam = f.home_team || {};
        const awayTeam = f.away_team || {};
        const timestamp = f.timestamp || Math.floor(Date.now() / 1000);

        return {
          area: { id: 76, name: 'Brazil', code: 'BR', flag: '' },
          competition: { id: BRASILEIRAO_INTERNAL_ID, name: 'Brasileirão Serie A', code: 'BSA', type: 'League', emblem: '' },
          season: { id: parseInt(BRASILEIRAO_SEASON_ID), startDate: '', endDate: '', currentMatchday: 0, winner: null },
          id: this.hashStringToNumber(String(matchId)),
          utcDate: this.timestampToIso(timestamp),
          status: 'IN_PLAY',
          matchday: f.round || 0,
          stage: 'REGULAR_SEASON',
          group: null,
          lastUpdated: this.timestampToIso(timestamp),
          homeTeam: {
            id: this.hashStringToNumber(String(homeTeam.team_id || `home_${index}`)),
            name: homeTeam.name || 'TBD',
            shortName: homeTeam.short_name || homeTeam.name || 'TBD',
            tla: (homeTeam.short_name || homeTeam.name || 'TBD').substring(0, 3).toUpperCase(),
            crest: homeTeam.small_image_path || homeTeam.logo || '',
          },
          awayTeam: {
            id: this.hashStringToNumber(String(awayTeam.team_id || `away_${index}`)),
            name: awayTeam.name || 'TBD',
            shortName: awayTeam.short_name || awayTeam.name || 'TBD',
            tla: (awayTeam.short_name || awayTeam.name || 'TBD').substring(0, 3).toUpperCase(),
            crest: awayTeam.small_image_path || awayTeam.logo || '',
          },
          score: {
            winner: null,
            duration: 'REGULAR',
            fullTime: {
              home: f.home_score ?? f.score?.home ?? null,
              away: f.away_score ?? f.score?.away ?? null,
            },
            halfTime: {
              home: f.home_score_ht ?? null,
              away: f.away_score_ht ?? null,
            },
          },
          odds: { msg: '' },
          referees: [],
        };
      }),
    };
  }

  // ===== Helper methods =====

  /**
   * Converts a unix timestamp (seconds) to ISO date string.
   */
  private timestampToIso(timestamp: number | undefined): string {
    if (!timestamp) return new Date().toISOString();
    return new Date(timestamp * 1000).toISOString();
  }

  /**
   * Generates a stable numeric hash from a string ID.
   * FlashScore uses string IDs (e.g., "GM5oorrh") but our domain uses numeric IDs.
   */
  private hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Extracts matchday number from a round string or returns the value if already a number.
   */
  private extractMatchday(round: any): number {
    if (typeof round === 'number') return round;
    if (typeof round === 'string') {
      const match = round.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    }
    return 1;
  }

  /**
   * Maintains a reverse mapping of hashed IDs to original FlashScore match IDs.
   */
  private matchIdMap = new Map<number, string>();

  private findOriginalMatchId(hashedId: number): string | null {
    // Check our reverse map
    for (const [key, value] of this.matchIdMap.entries()) {
      if (key === hashedId) return value;
    }
    // If not found, the caller should handle gracefully
    return null;
  }

  clearCache(): void {
    this.cache.clear();
    this.teamsCache.clear();
    this.matchIdMap.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
