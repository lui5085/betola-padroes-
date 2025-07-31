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
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
  area: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  currentSeason: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: any;
  };
  seasons: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: any;
  }[];
}

export interface FootballApiStandingsResponse {
  filters: any;
  area: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: any;
  };
  standings: {
    stage: string;
    type: string;
    group: string | null;
    table: {
      position: number;
      team: {
        id: number;
        name: string;
        shortName: string;
        tla: string;
        crest: string;
      };
      playedGames: number;
      form: string;
      won: number;
      draw: number;
      lost: number;
      points: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
    }[];
  }[];
}

export interface FootballApiFixturesResponse {
  filters: any;
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  matches: {
    area: {
      id: number;
      name: string;
      code: string;
      flag: string;
    };
    competition: {
      id: number;
      name: string;
      code: string;
      type: string;
      emblem: string;
    };
    season: {
      id: number;
      startDate: string;
      endDate: string;
      currentMatchday: number;
      winner: any;
    };
    id: number;
    utcDate: string;
    status: string;
    matchday: number;
    stage: string;
    group: string | null;
    lastUpdated: string;
    homeTeam: {
      id: number;
      name: string;
      shortName: string;
      tla: string;
      crest: string;
    };
    awayTeam: {
      id: number;
      name: string;
      shortName: string;
      tla: string;
      crest: string;
    };
    score: {
      winner: string;
      duration: string;
      fullTime: {
        home: number | null;
        away: number | null;
      };
      halfTime: {
        home: number | null;
        away: number | null;
      };
    } | null;
    odds: {
      msg: string;
    };
    referees: any[];
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
  count: number;
  filters: any;
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: any;
  };
  teams: {
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
    runningCompetitions: {
      id: number;
      name: string;
      code: string;
      type: string;
      emblem: string;
    }[];
    coach: {
      id: number;
      firstName: string;
      lastName: string;
      name: string;
      dateOfBirth: string;
      nationality: string;
    };
    squad: {
      id: number;
      name: string;
      position: string;
      dateOfBirth: string;
      nationality: string;
    }[];
    staff: any[];
    lastUpdated: string;
  }[];
}

export interface FootballApiTeamResponse {
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
  runningCompetitions: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  }[];
  coach: {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    dateOfBirth: string;
    nationality: string;
  };
  squad: {
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
  }[];
  staff: any[];
  lastUpdated: string;
}

export interface FootballApiService {
  getBrasileirao(): Promise<FootballApiLeagueResponse>;
  getCurrentRound(leagueId: number, season: number): Promise<FootballApiRoundsResponse>;
  getStandings(leagueId: number, season: number): Promise<FootballApiStandingsResponse>;
  getFixtures(leagueId: number, season: number, round?: string): Promise<FootballApiFixturesResponse>;
  getTeams(leagueId: number, season: number): Promise<FootballApiTeamsResponse>;
  getTeam(teamId: number): Promise<FootballApiTeamResponse>;
  getOdds(fixtureId: number): Promise<FootballApiOddsResponse>;
  getLiveMatches(leagueId: number): Promise<FootballApiFixturesResponse>;
}