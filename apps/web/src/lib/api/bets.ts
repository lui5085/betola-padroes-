import { apiClient } from './client';

export interface BetSelection {
  matchId: string;
  marketType: string;
  selection: string;
  odds: number;
}

export interface PlaceBetRequest {
  selections: BetSelection[];
  amount: number;
}

export interface BetResponse {
  id: string;
  totalOdds: number;
  potentialWin: number;
  amount: number;
  status: string;
  selections: BetSelection[];
  createdAt: string;
}

export interface GetBetsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBets {
  items: BetResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export async function placeBet(request: PlaceBetRequest): Promise<BetResponse> {
  return await apiClient.placeBet(request) as BetResponse;
}

export async function getUserBets(params?: GetBetsParams): Promise<PaginatedBets> {
  return await apiClient.getUserBets(params) as PaginatedBets;
}

export async function getBetDetails(betId: string): Promise<BetResponse> {
  return await apiClient.getUserBets({ betId }) as BetResponse;
}