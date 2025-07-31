export interface BrasileraoTeamDto {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  founded: number;
  venue: string;
  website: string;
}

export interface TeamDetailsDto {
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

export interface StandingsTableDto {
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

export interface BrasileraoStandingsDto {
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
  standings: StandingsTableDto[];
}