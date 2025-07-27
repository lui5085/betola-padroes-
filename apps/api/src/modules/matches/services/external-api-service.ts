// apps/api/src/modules/matches/services/external-api.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { 
  ExternalOddsResponse, 
  FootballApiResponse,
  ExternalMatch 
} from '@betola/core/modules/matches/domain/services/external-api-types';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly oddsApiUrl: string;
  private readonly footballApiUrl: string;
  private readonly footballApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.oddsApiUrl = this.configService.get<string>('ODDS_API_URL') || 'http://localhost:8000';
    this.footballApiUrl = this.configService.get<string>('FOOTBALL_API_URL') || 'https://v3.football.api-sports.io';
    this.footballApiKey = this.configService.get<string>('FOOTBALL_API_KEY') || '';
  }

  async fetchOdds(): Promise<ExternalOddsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ExternalOddsResponse>(`${this.oddsApiUrl}/api/odds`)
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch odds', error);
      throw new Error('Failed to fetch odds from external API');
    }
  }

  async fetchMatchResults(date: string): Promise<FootballApiResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<FootballApiResponse>(
          `${this.footballApiUrl}/fixtures`,
          {
            headers: {
              'x-rapidapi-key': this.footballApiKey,
              'x-rapidapi-host': 'v3.football.api-sports.io'
            },
            params: {
              league: 71, // Brasileiro Série A
              season: new Date().getFullYear(),
              date: date
            }
          }
        )
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch match results', error);
      throw new Error('Failed to fetch match results from API-Football');
    }
  }

  async fetchLiveMatches(): Promise<FootballApiResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<FootballApiResponse>(
          `${this.footballApiUrl}/fixtures`,
          {
            headers: {
              'x-rapidapi-key': this.footballApiKey,
              'x-rapidapi-host': 'v3.football.api-sports.io'
            },
            params: {
              league: 71, // Brasileiro Série A
              live: 'all'
            }
          }
        )
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch live matches', error);
      throw new Error('Failed to fetch live matches from API-Football');
    }
  }

  // Mapeia times do scraping para IDs da API-Football
  private teamNameMapping: Record<string, number> = {
    'Flamengo': 127,
    'Palmeiras': 121,
    'São Paulo': 126,
    'Atlético-MG': 1062,
    'Botafogo': 120,
    'Fluminense': 124,
    'Internacional': 119,
    'Grêmio': 130,
    'Corinthians': 131,
    'Santos': 128,
    'Bahia': 118,
    'Fortaleza': 154,
    'Cruzeiro': 123,
    'Vasco': 129,
    'Sport Recife': 771,
    'Ceará': 105,
    'Juventude': 132,
    'RB Bragantino': 794,
    'Vitória': 2384,
    'Mirassol': 1195
  };

  getTeamId(teamName: string): number {
    return this.teamNameMapping[teamName] || 0;
  }
}