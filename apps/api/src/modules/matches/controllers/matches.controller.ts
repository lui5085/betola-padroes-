import { Controller, Get, Post, Param, Query, UseGuards, NotFoundException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetUpcomingMatchesUseCase } from '../use-cases/get-upcoming-matches.use-case';
import { GetMatchMarketsUseCase } from '../use-cases/get-match-markets.use-case';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MatchResponseDto } from '../dto/match-response.dto';
import { MarketResponseDto } from '../dto/market-response.dto';
import { GetMatchesQueryDto } from '../dto/get-matches-query.dto';
import { MatchSyncService } from '../services/match-sync-service';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiTags('matches')
@ApiBearerAuth()
export class MatchesController {
  constructor(
    private readonly getUpcomingMatchesUseCase: GetUpcomingMatchesUseCase,
    private readonly getMatchMarketsUseCase: GetMatchMarketsUseCase,
    private readonly matchSyncService: MatchSyncService,
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService
  ) {}
  
  @Get()
  @ApiOperation({ summary: 'Get matches' })
  async getMatches(@Query() query: GetMatchesQueryDto): Promise<MatchResponseDto[]> {
    const result = await this.getUpcomingMatchesUseCase.execute({
      limit: query.limit,
      status: query.status
    });
    
    return result.value.map(match => MatchResponseDto.from(match));
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get match details' })
  async getMatchDetails(@Param('id') matchId: string): Promise<MatchResponseDto> {
    const result = await this.getUpcomingMatchesUseCase.execute({ matchId });
    
    if (!result.value.length) {
      throw new NotFoundException('Match not found');
    }
    
    return MatchResponseDto.from(result.value[0]);
  }
  
  @Get(':id/markets')
  @ApiOperation({ summary: 'Get match betting markets' })
  async getMatchMarkets(@Param('id') matchId: string): Promise<MarketResponseDto[]> {
    const result = await this.getMatchMarketsUseCase.execute({ matchId });
    
    return result.value.map(market => MarketResponseDto.from(market));
  }

  @Post('sync')
  @ApiOperation({ summary: 'Manually sync matches from Football API' })
  async syncMatches() {
    try {
      // Test API connection first
      const leagueResult = await this.footballApiService.getBrasileirao();
      
      if (!leagueResult.response || leagueResult.response.length === 0) {
        return {
          success: false,
          error: 'No league data returned from Football API'
        };
      }

      const league = leagueResult.response[0];
      // Use 2023 season as it has complete data
      const currentSeason = 2023;
      
      // Get fixtures for current season
      const fixturesResult = await this.footballApiService.getFixtures(
        league.league.id, 
        currentSeason
      );

      return {
        success: true,
        message: 'Sync completed successfully',
        data: {
          league: league.league.name,
          season: currentSeason,
          fixturesFound: fixturesResult.response?.length || 0,
          sampleFixtures: fixturesResult.response?.slice(0, 3) || [],
          apiInfo: {
            requestsMade: 2, // getBrasileirao + getFixtures
            remainingRequests: (fixturesResult as any).paging || 'unknown',
            responseStructure: fixturesResult.response ? 'valid' : 'empty'
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('debug/test-api')
  @ApiOperation({ summary: 'Test Football API connection' })
  async testApi() {
    try {
      const result = await this.footballApiService.getBrasileirao();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('debug/fetch-live')
  @ApiOperation({ summary: 'Force fetch live data from API' })
  async fetchLiveData(@CurrentUser() user: any) {
    try {
      console.log('Debug - Current user:', user);
      const useCase = this.getUpcomingMatchesUseCase as any;
      const apiData = await useCase.fetchFromApi(10);
      return {
        success: true,
        message: 'Fetched live data from API',
        user: user,
        data: apiData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('debug/user')
  @ApiOperation({ summary: 'Get current user info' })
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      user: user,
      timestamp: new Date().toISOString()
    };
  }
}