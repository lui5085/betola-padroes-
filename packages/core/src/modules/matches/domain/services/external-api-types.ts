// Tipos para a API de Odds (Python Scraper)
export interface ExternalOddsResponse {
  rodada: ExternalMatchOdds[];
}

export interface ExternalMatchOdds {
  mandante: string;
  visitante: string;
  odds: ExternalOdds;
}

export interface ExternalOdds {
  "resultado final": { casa: number; empate: number; fora: number };
  chance_dupla?: { "12": number; "1X": number; "X2": number };
  ambos_marcam?: { sim: number; nao: number };
  // Adicione outros mercados de odds conforme necessário
}

// Tipos para a API football-data.org v4
export interface CompetitionMatchesResponse {
  filters: {
    competitions: string[];
    matchday: string;
  };
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
  competition: Competition;
  matches: Match[];
}

export interface StandingsResponse {
  filters: {
    season: string;
  };
  area: Area;
  competition: Competition;
  season: Season;
  standings: Standing[];
}

interface Area {
  id: number;
  name: string;
  code: string;
  flag: string;
}

interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  winner: any; // Pode ser mais detalhado
}

interface Standing {
  stage: string;
  type: string;
  group: any; // Pode ser mais detalhado
  table: TableEntry[];
}

interface TableEntry {
  position: number;
  team: Team;
  playedGames: number;
  form: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Match {
  area: Area;
  competition: Competition;
  season: Season;
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group: any;
  lastUpdated: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  odds: {
    msg: string;
  };
  referees: any[];
}

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface Score {
  winner: string | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}