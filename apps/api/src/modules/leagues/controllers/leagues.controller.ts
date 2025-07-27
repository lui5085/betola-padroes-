import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateLeagueUseCase, JoinLeagueUseCase, GetLeagueRankingUseCase, GetUserLeaguesUseCase } from '@betola/core';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserPayload } from '../../auth/types/user-payload';
import { CreateLeagueDto } from '../dto/create-league.dto';
import { JoinLeagueDto } from '../dto/join-league.dto';
import { LeagueResponseDto } from '../dto/league-response.dto';
import { LeagueRankingDto } from '../dto/league-ranking.dto';

@Controller('leagues')
@UseGuards(JwtAuthGuard)
@ApiTags('leagues')
@ApiBearerAuth()
export class LeaguesController {
  constructor(
    private readonly createLeagueUseCase: CreateLeagueUseCase,
    private readonly joinLeagueUseCase: JoinLeagueUseCase,
    private readonly getLeagueRankingUseCase: GetLeagueRankingUseCase,
    private readonly getUserLeaguesUseCase: GetUserLeaguesUseCase
  ) {}
  
  @Post()
  @ApiOperation({ summary: 'Create a new league' })
  async createLeague(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateLeagueDto,
  ): Promise<LeagueResponseDto> {
    const result = await this.createLeagueUseCase.execute({
      ownerId: user.id,
      name: dto.name,
      description: dto.description,
      maxMembers: dto.maxMembers,
      isPrivate: dto.isPrivate,
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    
    return LeagueResponseDto.from(result.value);
  }
  
  @Get()
  @ApiOperation({ summary: 'Get user leagues' })
  async getUserLeagues(
    @CurrentUser() user: UserPayload,
  ): Promise<LeagueResponseDto[]> {
    const result = await this.getUserLeaguesUseCase.execute({
      userId: user.id,
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    
    return result.value.leagues.map(league => LeagueResponseDto.fromUserLeague(league));
  }
  
  @Post('join')
  @ApiOperation({ summary: 'Join a league using invite code' })
  async joinLeague(
    @CurrentUser() user: UserPayload,
    @Body() dto: JoinLeagueDto,
  ): Promise<{ message: string; league: LeagueResponseDto }> {
    const result = await this.joinLeagueUseCase.execute({
      userId: user.id,
      leagueCode: dto.code,
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    
    return {
      message: 'Successfully joined league',
      league: {
        id: result.value.leagueId,
        name: result.value.leagueName,
        memberCount: result.value.memberCount,
      } as LeagueResponseDto,
    };
  }
  
  @Get(':id/ranking')
  @ApiOperation({ summary: 'Get league ranking' })
  async getLeagueRanking(
    @CurrentUser() user: UserPayload,
    @Param('id') leagueId: string,
  ): Promise<LeagueRankingDto> {
    const result = await this.getLeagueRankingUseCase.execute({ 
      leagueId,
      userId: user.id 
    });
    
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    
    return LeagueRankingDto.from(result.value);
  }
}