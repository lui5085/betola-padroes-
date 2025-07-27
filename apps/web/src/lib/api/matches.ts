import { apiClient } from './client';

export interface Match {
  id: string;
  homeTeam: { name: string; logoUrl?: string };
  awayTeam: { name: string; logoUrl?: string };
  kickoffTime: string;
  status: string;
  round: number;
}

export async function getMatches(): Promise<Match[]> {
  try {
    const response = await apiClient.getMatches();
    return response as Match[];
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function getUpcomingMatches(params?: { limit?: number }): Promise<Match[]> {
  try {
    const response = await apiClient.getMatches(params);
    return response as Match[];
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
}

export async function getMatchMarkets(matchId: string): Promise<any[]> {
  try {
    const response = await apiClient.getMatchMarkets(matchId);
    return response as any[];
  } catch (error) {
    console.error('Error fetching match markets:', error);
    return [];
  }
}