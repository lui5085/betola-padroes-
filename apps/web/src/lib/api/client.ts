const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
class ApiClient {
  private token: string | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    } as Record<string, string>;

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async register(data: { email: string; username: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: { token: string; password: string }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.setAuthToken(null);
    }
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(data: any) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMatches(params?: { limit?: number; status?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/matches${queryString ? `?${queryString}` : ''}`);
  }

  async getMatchDetails(matchId: string) {
    return this.request(`/matches/${matchId}`);
  }

  async getMatchMarkets(matchId: string) {
    return this.request(`/bets/matches/${matchId}/markets`);
  }

  async placeBet(data: { selections: any[]; amount: number }) {
    return this.request('/bets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserBets(params?: { status?: string; limit?: number; offset?: number }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/bets${queryString ? `?${queryString}` : ''}`);
  }

  async getBetDetails(betId: string) {
    return this.request(`/bets/${betId}`);
  }

  async calculateBet(data: {
    selections: Array<{ odds: number }>;
    amount: number;
    type: 'SINGLE' | 'MULTIPLE' | 'SYSTEM';
  }) {
    return this.request('/bets/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request('/bets/stats/summary');
  }

  async getUserWallet() {
    return this.request('/wallet/balance');
  }

  async addFunds(amount: number) {
    return this.request('/wallet/add-funds', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getLeagues() {
    return this.request('/leagues');
  }

  async getUserLeagues() {
    return this.request('/leagues/user');
  }

  async createLeague(data: { name: string; description?: string; isPrivate: boolean }) {
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

  async getLeagueDetails(leagueId: string) {
    return this.request(`/leagues/${leagueId}`);
  }

  async getLeagueRanking(leagueId: string) {
    return this.request(`/leagues/${leagueId}/ranking`);
  }

  async syncMatches() {
    return this.request('/bets/sync-odds', {
      method: 'POST',
    });
  }

  async settleBets() {
    return this.request('/bets/settle', {
      method: 'POST',
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();