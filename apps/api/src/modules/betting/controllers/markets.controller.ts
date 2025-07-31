import { Controller, Get, Param, UseGuards, Query, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetMatchMarketsUseCase } from '@betola/core/modules/betting/application/use-cases/get-match-markets';
import { SyncMatchOddsUseCase } from '../use-cases/sync-match-odds.use-case';
import { SyncBrasileraoDataUseCase } from '@betola/core/modules/matches/application/use-cases/sync-brasileirao-data';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';

@Controller('markets')
@UseGuards(JwtAuthGuard)
export class MarketsController {
  constructor(
    private readonly getMatchMarketsUseCase: GetMatchMarketsUseCase,
    private readonly syncMatchOddsUseCase: SyncMatchOddsUseCase,
    private readonly syncBrasileraoDataUseCase: SyncBrasileraoDataUseCase,
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService
  ) {}

  @Get('match/:matchId')
  async getMarketsForMatch(@Param('matchId') matchId: string) {
    const result = await this.getMatchMarketsUseCase.execute({ matchId });
    
    if (result.isFailure()) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: result.value
    };
  }

  @Get('sync')
  async syncOdds(@Query('matchId') matchId?: string) {
    const result = await this.syncMatchOddsUseCase.execute({
      matchId: matchId ? { value: matchId } as any : undefined
    });

    if (result.isFailure()) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: result.value
    };
  }

  @Get('sync-brasileirao')
  async syncBrasileirao() {
    const result = await this.syncBrasileraoDataUseCase.execute();

    if (result.isFailure()) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: result.value
    };
  }

}