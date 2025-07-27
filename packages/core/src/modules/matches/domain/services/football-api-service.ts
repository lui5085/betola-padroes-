export interface FootballApiConfig {
  apiKey: string;
  baseUrl: string;
  cacheTtl: {
    leagues: number;
    standings: number;
    fixtures: number;
    liveMatches: number;
  };
}

export interface FootballApiLeagueResponse {
  response: {
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
    };
    seasons: {
      year: number;
      start: string;
      end: string;
      current: boolean;
    }[];
  }[];
}

export interface FootballApiStandingsResponse {
  response: {
    league: {
      id: number;
      name: string;
      standings: {
        rank: number;
        team: {
          id: number;
          name: string;
          logo: string;
        };
        points: number;
        goalsDiff: number;
        group: string;
        form: string;
        status: string;
        description: string;
        all: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: {
            for: number;
            against: number;
          };
        };
        home: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: {
            for: number;
            against: number;
          };
        };
        away: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: {
            for: number;
            against: number;
          };
        };
      }[][];
    };
  }[];
}

export interface FootballApiFixturesResponse {
  response: {
    fixture: {
      id: number;
      referee: string;
      timezone: string;
      date: string;
      timestamp: number;
      periods: {
        first: number;
        second: number;
      };
      venue: {
        id: number;
        name: string;
        city: string;
      };
      status: {
        long: string;
        short: string;
        elapsed: number;
      };
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
      round: string;
    };
    teams: {
      home: {
        id: number;
        name: string;
        logo: string;
        winner: boolean | null;
      };
      away: {
        id: number;
        name: string;
        logo: string;
        winner: boolean | null;
      };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
    score: {
      halftime: {
        home: number | null;
        away: number | null;
      };
      fulltime: {
        home: number | null;
        away: number | null;
      };
      extratime: {
        home: number | null;
        away: number | null;
      };
      penalty: {
        home: number | null;
        away: number | null;
      };
    };
  }[];
}

export interface FootballApiOddsResponse {
  response: {
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    fixture: {
      id: number;
      timezone: string;
      date: string;
      timestamp: number;
    };
    update: string;
    bookmakers: {
      id: number;
      name: string;
      bets: {
        id: number;
        name: string;
        values: {
          value: string;
          odd: string;
        }[];
      }[];
    }[];
  }[];
}

export interface FootballApiRoundsResponse {
  response: string[];
}

export interface FootballApiTeamsResponse {
  response: {
    team: {
      id: number;
      name: string;
      code: string;
      country: string;
      founded: number;
      national: boolean;
      logo: string;
    };
    venue: {
      id: number;
      name: string;
      address: string;
      city: string;
      capacity: number;
      surface: string;
      image: string;
    };
  }[];
}

export interface FootballApiService {
  getBrasileirao(): Promise<FootballApiLeagueResponse>;
  getCurrentRound(leagueId: number, season: number): Promise<FootballApiRoundsResponse>;
  getStandings(leagueId: number, season: number): Promise<FootballApiStandingsResponse>;
  getFixtures(leagueId: number, season: number, round?: string): Promise<FootballApiFixturesResponse>;
  getTeams(leagueId: number, season: number): Promise<FootballApiTeamsResponse>;
  getOdds(fixtureId: number): Promise<FootballApiOddsResponse>;
  getLiveMatches(leagueId: number): Promise<FootballApiFixturesResponse>;
}