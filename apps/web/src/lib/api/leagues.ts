import { apiClient } from './client';

export interface CreateLeagueRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  maxMembers?: number;
  isPrivate: boolean;
}

export interface JoinLeagueRequest {
  code: string;
}

export interface League {
  id: string;
  name: string;
  code: string;
  description: string;
  imageUrl?: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isOwner?: boolean;
  userRole?: string;
  userPosition?: number;
  userPoints?: number;
}

export interface LeagueMember {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  totalPoints: number;
  wonBets: number;
  lostBets: number;
  position?: number;
  joinedAt: Date;
}

export interface LeagueDetails {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  code: string;
  ownerId: string;
  maxMembers: number;
  isPrivate: boolean;
  memberCount: number;
  members: LeagueMember[];
  userRole?: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
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

export async function getLeagueDetails(leagueId: string): Promise<LeagueDetails> {
  return await apiClient.get(`/leagues/${leagueId}`) as LeagueDetails;
}

export async function leaveLeague(leagueId: string): Promise<{ success: boolean; message: string }> {
  return await apiClient.post(`/leagues/${leagueId}/leave`) as { success: boolean; message: string };
}

export async function updateLeague(leagueId: string, data: { name?: string; description?: string; imageUrl?: string; maxMembers?: number; isPrivate?: boolean }) {
  return apiClient.put(`/leagues/${leagueId}`, data);
}

export async function inviteUserByUsername(leagueId: string, username: string) {
  return apiClient.post(`/leagues/${leagueId}/invite`, { username });
}