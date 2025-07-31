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

export class FootballApiClient implements FootballApiService {
  private readonly config: FootballApiConfig;
  private readonly cache = new Map<string, { data: any; expiry: number }>();
  private lastRequestTime = 0;
  private readonly minRequestInterval = 2000; // 2 seconds between requests

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
    
    console.log('🌐 Making Football API request:', {
      url,
      method: 'GET',
      apiKey: this.config.apiKey ? `${this.config.apiKey.slice(0, 8)}...${this.config.apiKey.slice(-4)}` : 'NOT SET',
      headers: {
        'X-Auth-Token': this.config.apiKey ? 'SET' : 'NOT SET',
        'User-Agent': 'Betola-App/1.0'
      }
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': this.config.apiKey,
        'User-Agent': 'Betola-App/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Football API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Log response body for debugging on errors
    if (!response.ok) {
      let errorBody = 'No body';
      try {
        errorBody = await response.text();
        console.log('❌ Error response body:', errorBody);
      } catch (e) {
        console.log('❌ Could not read error response body');
      }
      
      throw new Error(`Football API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    
    console.log('✅ API response data sample:', {
      hasData: !!data,
      dataType: typeof data,
      keys: data && typeof data === 'object' ? Object.keys(data).slice(0, 5) : 'not object'
    });
    
    // Check for API errors
    if (data.results === 0 && data.error) {
      throw new Error(`Football API error: ${data.error}`);
    }

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

  async getBrasileirao(): Promise<FootballApiLeagueResponse> {
    return this.request<FootballApiLeagueResponse>(
      '/competitions/2013',
      this.config.cacheTtl.leagues
    );
  }

  async getCurrentRound(leagueId: number, season: number): Promise<FootballApiRoundsResponse> {
    return this.request<FootballApiRoundsResponse>(
      `/fixtures/rounds?league=${leagueId}&season=${season}&current=true`,
      3600 // 1 hour cache
    );
  }

  async getStandings(leagueId: number, season: number): Promise<FootballApiStandingsResponse> {
    return this.request<FootballApiStandingsResponse>(
      `/competitions/${leagueId}/standings`,
      this.config.cacheTtl.standings
    );
  }

  async getFixtures(leagueId: number, season: number, round?: string): Promise<FootballApiFixturesResponse> {
    let endpoint = `/competitions/${leagueId}/matches?season=${season}`;
    if (round) {
      endpoint += `&matchday=${round}`;
    }
    
    return this.request<FootballApiFixturesResponse>(
      endpoint,
      this.config.cacheTtl.fixtures
    );
  }

  async getTeams(leagueId: number, season: number): Promise<FootballApiTeamsResponse> {
    return this.request<FootballApiTeamsResponse>(
      `/competitions/${leagueId}/teams`,
      this.config.cacheTtl.standings // Teams don't change often
    );
  }

  async getTeam(teamId: number): Promise<FootballApiTeamResponse> {
    return this.request<FootballApiTeamResponse>(
      `/teams/${teamId}`,
      this.config.cacheTtl.standings // Team details don't change often
    );
  }

  async getOdds(fixtureId: number): Promise<FootballApiOddsResponse> {
    return this.request<FootballApiOddsResponse>(
      `/odds?fixture=${fixtureId}&bookmaker=8`, // Bet365 bookmaker
      1800 // 30 minutes cache
    );
  }

  async getLiveMatches(leagueId: number): Promise<FootballApiFixturesResponse> {
    return this.request<FootballApiFixturesResponse>(
      `/fixtures?league=${leagueId}&live=all`,
      this.config.cacheTtl.liveMatches
    );
  }

  // Clear cache method for testing or manual refresh
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats for monitoring
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}