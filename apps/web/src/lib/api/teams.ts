import { apiClient } from './client';

export interface BrasileraoTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  founded: number;
  venue: string;
  website: string;
}

export interface TeamDetails {
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

export interface StandingsTable {
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

export interface BrasileraoStandings {
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

export async function getBrasileraoTeams(): Promise<BrasileraoTeam[]> {
  return apiClient.get<BrasileraoTeam[]>('/teams/brasileirao');
}

export async function getTeamDetails(teamId: number): Promise<TeamDetails> {
  return apiClient.get<TeamDetails>(`/teams/${teamId}`);
}

export async function getBrasileraoStandings(): Promise<BrasileraoStandings> {
  return apiClient.get<BrasileraoStandings>('/teams/brasileirao/standings');
}