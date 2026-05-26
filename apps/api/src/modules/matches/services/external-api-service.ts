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
  private readonly flashscoreBaseUrl: string;
  private readonly flashscoreApiKey: string;
  private readonly flashscoreApiHost: string;
  private readonly tournamentTemplateId: string;
  private readonly tournamentId: string;
  private readonly tournamentStageId: string;
  private readonly seasonId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.oddsApiUrl = this.configService.get<string>('ODDS_API_URL');
    this.flashscoreBaseUrl = this.configService.get<string>('FLASHSCORE_BASE_URL') || 'https://flashscore4.p.rapidapi.com/api/flashscore/v2';
    this.flashscoreApiKey = this.configService.get<string>('FLASHSCORE_API_KEY') || '';
    this.flashscoreApiHost = this.configService.get<string>('FLASHSCORE_API_HOST') || 'flashscore4.p.rapidapi.com';
    this.tournamentTemplateId = this.configService.get<string>('BRASILEIRAO_TOURNAMENT_TEMPLATE_ID') || 'Yq4hUnzQ';
    this.tournamentId = this.configService.get<string>('BRASILEIRAO_TOURNAMENT_ID') || 'pv7V3RRE';
    this.tournamentStageId = this.configService.get<string>('BRASILEIRAO_TOURNAMENT_STAGE_ID') || 'hdLUdQGi';
    this.seasonId = this.configService.get<string>('BRASILEIRAO_SEASON_ID') || '185';
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

  // Busca a rodada atual do Brasileirão via FlashScore standings
  async fetchCurrentMatchday(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(
          `${this.flashscoreBaseUrl}/tournaments/standings`,
          {
            headers: {
              'x-rapidapi-key': this.flashscoreApiKey,
              'x-rapidapi-host': this.flashscoreApiHost,
            },
            params: {
              tournament_id: this.tournamentId,
              tournament_stage_id: this.tournamentStageId,
              type: 'overall',
            },
          },
        ),
      );
      
      // Derive current matchday from max played games in standings
      const standings = response.data?.data || response.data?.standings || response.data || [];
      const rows = Array.isArray(standings) ? standings : [];
      
      const maxPlayed = rows.reduce((max: number, entry: any) => {
        const played = entry.matches_total || entry.played || entry.games_played || 0;
        return Math.max(max, played);
      }, 0);

      return maxPlayed || 1;
    } catch (error) {
      this.logger.error('Failed to fetch current matchday', error.message);
      throw new Error('Failed to fetch current matchday from FlashScore API');
    }
  }

  // Busca as partidas de uma rodada específica do Brasileirão
  async fetchMatchesByMatchday(matchday: number): Promise<Match[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(
          `${this.flashscoreBaseUrl}/tournaments/fixtures`,
          {
            headers: {
              'x-rapidapi-key': this.flashscoreApiKey,
              'x-rapidapi-host': this.flashscoreApiHost,
            },
            params: {
              tournament_template_id: this.tournamentTemplateId,
              season_id: this.seasonId,
              page: '1',
            },
          },
        ),
      );

      // Map FlashScore fixtures response to our Match interface
      const fixtures = response.data?.data || response.data?.fixtures || response.data || [];
      const allFixtures = Array.isArray(fixtures) ? fixtures : [];

      // Filter by matchday if the response includes round info
      const matchdayFixtures = allFixtures.filter((f: any) => {
        const round = f.round || f.matchday;
        if (round && typeof round === 'number') return round === matchday;
        if (round && typeof round === 'string') {
          const roundNum = parseInt(round.replace(/\D/g, '') || '0');
          return roundNum === matchday;
        }
        // If no round info, include all (the caller will handle filtering)
        return true;
      });

      return matchdayFixtures.map((f: any) => ({
        area: { id: 76, name: 'Brazil', code: 'BR', flag: '' },
        competition: { id: 71, name: 'Brasileirão Serie A', code: 'BSA', type: 'League', emblem: '' },
        season: { id: parseInt(this.seasonId), startDate: '', endDate: '', currentMatchday: matchday, winner: null },
        id: f.match_id || f.id,
        utcDate: f.timestamp ? new Date(f.timestamp * 1000).toISOString() : new Date().toISOString(),
        status: 'TIMED', // Fixtures endpoint returns upcoming matches
        matchday,
        stage: 'REGULAR_SEASON',
        group: null,
        lastUpdated: f.timestamp ? new Date(f.timestamp * 1000).toISOString() : new Date().toISOString(),
        homeTeam: {
          id: f.home_team?.team_id || 0,
          name: f.home_team?.name || 'TBD',
          shortName: f.home_team?.short_name || f.home_team?.name || 'TBD',
          tla: (f.home_team?.short_name || f.home_team?.name || 'TBD').substring(0, 3).toUpperCase(),
          crest: f.home_team?.small_image_path || '',
        },
        awayTeam: {
          id: f.away_team?.team_id || 0,
          name: f.away_team?.name || 'TBD',
          shortName: f.away_team?.short_name || f.away_team?.name || 'TBD',
          tla: (f.away_team?.short_name || f.away_team?.name || 'TBD').substring(0, 3).toUpperCase(),
          crest: f.away_team?.small_image_path || '',
        },
        score: {
          winner: null,
          duration: 'REGULAR',
          fullTime: {
            home: null,
            away: null,
          },
          halfTime: {
            home: null,
            away: null,
          },
        },
        odds: { msg: '' },
        referees: [],
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch matches for matchday ${matchday}`, error.message);
      throw new Error(`Failed to fetch matches for matchday ${matchday} from FlashScore API`);
    }
  }
}
