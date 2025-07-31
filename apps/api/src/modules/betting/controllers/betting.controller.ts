import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  NotFoundException,
  BadRequestException,
  Inject,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserPayload } from '../../auth/types/user-payload';
import { PlaceBetDto } from '../dto/place-bet.dto';
import { BetResponseDto } from '../dto/bet-response.dto';
import { GetBetsQueryDto } from '../dto/get-bets-query.dto';
import { MarketResponseDto } from '../../matches/dto/market-response.dto';
import { PlaceBetUseCase, PlaceBetRequest } from '@betola/core';
import { GetUserBetsUseCase } from '../use-cases/get-user-bets.use-case';
import { CalculateBetUseCase } from '@betola/core/modules/betting/application/use-cases/calculate-bet';
import { SettleBetsUseCase } from '@betola/core/modules/betting/application/use-cases/settle-bets';
import { SyncMatchOddsUseCase } from '../use-cases/sync-match-odds.use-case';
import { GetMatchMarketsUseCase } from '../use-cases/get-match-markets.use-case';
import { MarketsRepository } from '@betola/core/modules/betting/domain/repositories/markets-repository';
import { MatchId } from '@betola/core/modules/matches/domain/value-objects/match-id';

@Controller('bets')
@UseGuards(JwtAuthGuard)
@ApiTags('betting')
@ApiBearerAuth()
export class BettingController {
  constructor(
    @Inject('PlaceBetUseCase') private readonly placeBetUseCase: any,
    private readonly getUserBetsUseCase: GetUserBetsUseCase,
    private readonly calculateBetUseCase: CalculateBetUseCase,
    private readonly settleBetsUseCase: SettleBetsUseCase,
    private readonly syncMatchOddsUseCase: SyncMatchOddsUseCase,
    private readonly getMatchMarketsUseCase: GetMatchMarketsUseCase,
    @Inject('MarketsRepository') private readonly marketsRepository: MarketsRepository
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async placeBet(
    @Body() request: PlaceBetRequest,
    @CurrentUser() user: UserPayload,
  ) {
    if (!user || !user.id || typeof user.id !== 'string' || user.id.trim() === '') {
      throw new HttpException('User not authenticated or invalid user ID', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.placeBetUseCase.execute({
      ...request,
      userId: user.id,
    });

    if (result.isFailure()) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return result.value;
  }

  @Get()
  @ApiOperation({ summary: 'Get user bets' })
  @ApiResponse({ status: 200, description: 'List of user bets', type: [BetResponseDto] })
  async getUserBets(
    @CurrentUser() user: any,
    @Query() query: GetBetsQueryDto
  ): Promise<BetResponseDto[]> {
    const result = await this.getUserBetsUseCase.execute({
      userId: user.id,
      status: query.status,
      limit: query.limit,
      page: query.offset ? Math.floor(query.offset / (query.limit || 20)) + 1 : 1
    });

    return result.value.items.map(bet => BetResponseDto.from(bet));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bet details' })
  @ApiResponse({ status: 200, description: 'Bet details', type: BetResponseDto })
  @ApiResponse({ status: 404, description: 'Bet not found' })
  async getBetDetails(
    @CurrentUser() user: any,
    @Param('id') betId: string
  ): Promise<BetResponseDto> {
    const result = await this.getUserBetsUseCase.execute({
      userId: user.id,
      betId
    });

    if (!result.value.items.length) {
      throw new NotFoundException('Bet not found');
    }

    return BetResponseDto.from(result.value.items[0]);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate potential bet return' })
  @ApiResponse({ status: 200, description: 'Calculated bet return' })
  async calculateBet(@Body() dto: PlaceBetDto): Promise<{
    totalOdds: number;
    potentialReturn: number;
    potentialProfit: number;
  }> {
    const result = await this.calculateBetUseCase.execute({
      selections: dto.selections.map(sel => ({
        odds: sel.odds
      })),
      amount: dto.amount,
      type: dto.type
    });

    return result.value;
  }

  @Get('matches/:matchId/markets')
  @ApiOperation({ summary: 'Get betting markets for a match' })
  @ApiResponse({ status: 200, description: 'List of markets', type: [MarketResponseDto] })
  async getMatchMarkets(@Param('matchId') matchId: string): Promise<MarketResponseDto[]> {
    const markets = await this.marketsRepository.findActiveByMatch(new MatchId(matchId));
    
    if (!markets.length) {
      // Try to sync odds if no markets found
      await this.syncMatchOddsUseCase.execute({ matchId });
      // Fetch again after sync
      const syncedMarkets = await this.marketsRepository.findActiveByMatch(new MatchId(matchId));
      return syncedMarkets.map(market => MarketResponseDto.from(market));
    }

    return markets.map(market => MarketResponseDto.from(market));
  }

  @Post('sync-odds')
  @ApiOperation({ summary: 'Manually sync odds from Football API' })
  @ApiResponse({ status: 200, description: 'Sync completed' })
  async syncOdds(@Query('matchId') matchId?: string): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    try {
      const result = await this.syncMatchOddsUseCase.execute({
        matchId,
        forceRefresh: true
      });

      if (!result.isSuccess) {
        return {
          success: false,
          message: result.error,
          data: null
        };
      }

      return {
        success: true,
        message: 'Odds synced successfully',
        data: result.value
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  @Post('settle')
  @ApiOperation({ summary: 'Manually trigger bet settlement' })
  @ApiResponse({ status: 200, description: 'Settlement completed' })
  async settleBets(): Promise<{
    success: boolean;
    message: string;
    settledCount: number;
  }> {
    try {
      const result = await this.settleBetsUseCase.execute();

      if (!result.isSuccess) {
        return {
          success: false,
          message: result.error,
          settledCount: 0
        };
      }

      return {
        success: true,
        message: 'Bets settled successfully',
        settledCount: result.value.settledCount
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        settledCount: 0
      };
    }
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get user betting statistics' })
  @ApiResponse({ status: 200, description: 'User betting statistics' })
  async getUserStats(@CurrentUser() user: any): Promise<{
    totalBets: number;
    wonBets: number;
    lostBets: number;
    pendingBets: number;
    totalStaked: number;
    totalWon: number;
    totalLost: number;
    profit: number;
    roi: number;
  }> {
    const bets = await this.getUserBetsUseCase.execute({
      userId: user.id
    });

    const stats = {
      totalBets: bets.value.items.length,
      wonBets: 0,
      lostBets: 0,
      pendingBets: 0,
      totalStaked: 0,
      totalWon: 0,
      totalLost: 0,
      profit: 0,
      roi: 0
    };

    for (const bet of bets.value.items) {
      stats.totalStaked += bet.amount;

      switch (bet.status) {
        case 'WON':
          stats.wonBets++;
          stats.totalWon += bet.potentialReturn;
          break;
        case 'LOST':
          stats.lostBets++;
          stats.totalLost += bet.amount;
          break;
        case 'PENDING':
          stats.pendingBets++;
          break;
      }
    }

    stats.profit = stats.totalWon - stats.totalStaked;
    stats.roi = stats.totalStaked > 0 ? (stats.profit / stats.totalStaked) * 100 : 0;

    return stats;
  }
}