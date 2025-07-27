import { 
  FootballApiService, 
  FootballApiConfig,
  FootballApiLeagueResponse,
  FootballApiStandingsResponse,
  FootballApiFixturesResponse,
  FootballApiOddsResponse,
  FootballApiRoundsResponse,
  FootballApiTeamsResponse
} from '@betola/core/modules/matches/domain/services/football-api-service';

export class FootballApiClient implements FootballApiService {
  private readonly config: FootballApiConfig;
  private readonly cache = new Map<string, { data: any; expiry: number }>();

  constructor(config: FootballApiConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, cacheTtl?: number): Promise<T> {
    const cacheKey = endpoint;
    
    // Check cache first
    if (cacheTtl) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        return cached.data;
      }
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': this.config.apiKey,
        'X-RapidAPI-Host': this.config.baseUrl.includes('rapidapi') 
          ? 'api-football-v1.p.rapidapi.com' 
          : 'v3.football.api-sports.io'
      }
    });

    if (!response.ok) {
      throw new Error(`Football API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
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
    }

    return data;
  }

  async getBrasileirao(): Promise<FootballApiLeagueResponse> {
    return this.request<FootballApiLeagueResponse>(
      '/leagues?country=Brazil&name=Serie%20A&current=true',
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
      `/standings?league=${leagueId}&season=${season}`,
      this.config.cacheTtl.standings
    );
  }

  async getFixtures(leagueId: number, season: number, round?: string): Promise<FootballApiFixturesResponse> {
    let endpoint = `/fixtures?league=${leagueId}&season=${season}`;
    if (round) {
      endpoint += `&round=${encodeURIComponent(round)}`;
    }
    
    return this.request<FootballApiFixturesResponse>(
      endpoint,
      this.config.cacheTtl.fixtures
    );
  }

  async getTeams(leagueId: number, season: number): Promise<FootballApiTeamsResponse> {
    return this.request<FootballApiTeamsResponse>(
      `/teams?league=${leagueId}&season=${season}`,
      this.config.cacheTtl.standings // Teams don't change often
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