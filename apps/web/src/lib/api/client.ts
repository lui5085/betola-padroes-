import { LoginUserDto, RegisterUserDto } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Importante para incluir cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterUserDto) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginUserDto) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async resendVerification(email: string) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Outros endpoints...
  async getMatches(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/matches${queryString ? `?${queryString}` : ''}`);
  }

  async getMatchMarkets(matchId: string) {
    return this.request(`/matches/${matchId}/markets`);
  }

  async placeBet(data: any) {
    return this.request('/bets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserBets(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bets${queryString ? `?${queryString}` : ''}`);
  }

  async getLeagues() {
    return this.request('/leagues');
  }

  async createLeague(data: any) {
    return this.request('/leagues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinLeague(code: string) {
    return this.request('/leagues/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getLeagueRanking(leagueId: string) {
    return this.request(`/leagues/${leagueId}/ranking`);
  }

  // Betting endpoints  
  async getBettingMarkets(matchId: string) {
    return this.request(`/markets/match/${matchId}`);
  }

  async syncOdds(matchId?: string) {
    const params = matchId ? `?matchId=${matchId}` : '';
    return this.request(`/markets/sync${params}`, {
      method: 'GET',
    });
  }

  async getAvailableMatches() {
    return this.request('/matches?available=true');
  }

  async getUserWallet() {
    return this.request('/wallet');
  }
}

export const apiClient = new ApiClient(API_URL);
