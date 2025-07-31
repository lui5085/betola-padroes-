// apps/api/src/modules/matches/services/external-api.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ExternalOddsResponse,
  CompetitionMatchesResponse,
  StandingsResponse,
  Match,
} from '@betola/core/modules/matches/domain/services/external-api-types';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly oddsApiUrl: string;
  private readonly footballDataApiUrl: string;
  private readonly footballDataApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.oddsApiUrl = this.configService.get<string>('ODDS_API_URL');
    this.footballDataApiUrl = this.configService.get<string>('FOOTBALL_DATA_API_URL');
    this.footballDataApiKey = this.configService.get<string>('FOOTBALL_DATA_API_KEY');
  }

  // Busca odds da API Python
  async fetchOdds(): Promise<ExternalOddsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ExternalOddsResponse>(`${this.oddsApiUrl}/api/odds`),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch odds from scraper API', error.message);
      throw new Error('Failed to fetch odds from external scraper API');
    }
  }

  // Busca a rodada atual do Brasileirão
  async fetchCurrentMatchday(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<StandingsResponse>(
          `${this.footballDataApiUrl}/competitions/BSA/standings`,
          {
            headers: { 'X-Auth-Token': this.footballDataApiKey },
          },
        ),
      );
      return response.data.season.currentMatchday;
    } catch (error) {
      this.logger.error('Failed to fetch current matchday', error.message);
      throw new Error('Failed to fetch current matchday from football-data.org');
    }
  }

  // Busca as partidas de uma rodada específica do Brasileirão
  async fetchMatchesByMatchday(matchday: number): Promise<Match[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CompetitionMatchesResponse>(
          `${this.footballDataApiUrl}/competitions/BSA/matches`,
          {
            headers: { 'X-Auth-Token': this.footballDataApiKey },
            params: { matchday },
          },
        ),
      );
      return response.data.matches;
    } catch (error) {
      this.logger.error(`Failed to fetch matches for matchday ${matchday}`, error.message);
      throw new Error(`Failed to fetch matches for matchday ${matchday} from football-data.org`);
    }
  }
}