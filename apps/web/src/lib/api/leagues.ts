import { apiClient } from './client';

export interface CreateLeagueRequest {
  name: string;
  description?: string;
  maxMembers?: number;
  isPrivate?: boolean;
}

export interface JoinLeagueRequest {
  code: string;
}

export interface League {
  id: string;
  name: string;
  code: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isOwner?: boolean;
  userRole?: string;
  userPosition?: number;
  userPoints?: number;
}

export interface LeagueRankingItem {
  position: number;
  userId: string;
  username: string;
  totalPoints: number;
  wonBets: number;
  lostBets: number;
  totalBets: number;
  winRate: number;
  profitMargin: number;
  isCurrentUser?: boolean;
}

export interface LeagueRanking {
  leagueId: string;
  leagueName: string;
  ranking: LeagueRankingItem[];
  currentUserPosition?: number;
}

export async function createLeague(request: CreateLeagueRequest): Promise<League> {
  return await apiClient.createLeague(request) as League;
}

export async function joinLeague(request: JoinLeagueRequest): Promise<{ message: string; league: League }> {
  return await apiClient.joinLeague(request.code) as { message: string; league: League };
}

export async function getUserLeagues(): Promise<League[]> {
  return await apiClient.getLeagues() as League[];
}

export async function getLeagueRanking(leagueId: string): Promise<LeagueRanking> {
  return await apiClient.getLeagueRanking(leagueId) as LeagueRanking;
}