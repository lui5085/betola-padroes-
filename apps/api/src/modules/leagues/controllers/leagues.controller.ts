import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { 
  CreateLeagueUseCase, 
  JoinLeagueUseCase, 
  GetLeagueRankingUseCase, 
  GetUserLeaguesUseCase,
  GetLeagueDetailsUseCase,
  LeaveLeagueUseCase,
  UpdateMemberStatsUseCase,
  UpdateLeagueUseCase,
  InviteUserByUsernameUseCase
} from '@betola/core';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserPayload } from '../../auth/types/user-payload';
import { CreateLeagueDto } from '../dto/create-league.dto';
import { UpdateLeagueDto } from '../dto/update-league.dto';
import { JoinLeagueDto } from '../dto/join-league.dto';
import { LeagueResponseDto } from '../dto/league-response.dto';
import { LeagueRankingDto } from '../dto/league-ranking.dto';
import { NotificationsHelper } from '../../notifications/notifications.helper';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Controller('leagues')
@UseGuards(JwtAuthGuard)
@ApiTags('leagues')
@ApiBearerAuth()
export class LeaguesController {
  constructor(
    private readonly createLeagueUseCase: CreateLeagueUseCase,
    private readonly joinLeagueUseCase: JoinLeagueUseCase,
    private readonly getLeagueRankingUseCase: GetLeagueRankingUseCase,
    private readonly getUserLeaguesUseCase: GetUserLeaguesUseCase,
    private readonly getLeagueDetailsUseCase: GetLeagueDetailsUseCase,
    private readonly leaveLeagueUseCase: LeaveLeagueUseCase,
    private readonly updateMemberStatsUseCase: UpdateMemberStatsUseCase,
    private readonly updateLeagueUseCase: UpdateLeagueUseCase,
    private readonly inviteUserByUsernameUseCase: InviteUserByUsernameUseCase,
    private readonly notificationsHelper: NotificationsHelper,
    private readonly prisma: PrismaService
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
      imageUrl: dto.imageUrl,
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

    // Get user profile for notification
    const userProfile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });

    // Get league members to notify them about the new member
    const leagueMembers = await this.prisma.leagueMember.findMany({
      where: { 
        leagueId: result.value.leagueId,
        userId: { not: user.id } // Don't notify the new member
      },
      include: { user: { include: { profile: true } } }
    });

    // Send notifications to existing league members
    const memberName = userProfile?.displayName || user.username;
    await Promise.allSettled(
      leagueMembers.map(member =>
        this.notificationsHelper.notifyLeagueJoined({
          userId: member.userId,
          leagueName: result.value.leagueName,
          newMemberName: memberName,
          leagueId: result.value.leagueId,
        })
      )
    );
    
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

  @Get(':id')
  @ApiOperation({ summary: 'Get league details' })
  async getLeagueDetails(
    @CurrentUser() user: UserPayload,
    @Param('id') leagueId: string,
  ) {
    const result = await this.getLeagueDetailsUseCase.execute({
      leagueId,
      userId: user.id
    });
    
    if (result.isFailure()) {
      throw new NotFoundException(result.error);
    }
    
    return result.value;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update league settings' })
  async updateLeague(
    @CurrentUser() user: UserPayload,
    @Param('id') leagueId: string,
    @Body() dto: UpdateLeagueDto,
  ) {
    const result = await this.updateLeagueUseCase.execute({
      leagueId,
      userId: user.id,
      ...dto
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    
    return result.value;
  }


  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a league' })
  async leaveLeague(
    @CurrentUser() user: UserPayload,
    @Param('id') leagueId: string,
  ) {
    const result = await this.leaveLeagueUseCase.execute({
      leagueId,
      userId: user.id
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    
    return result.value;
  }

  @Put(':id/members/:userId/stats')
  @ApiOperation({ summary: 'Update member stats (internal use)' })
  async updateMemberStats(
    @Param('id') leagueId: string,
    @Param('userId') userId: string,
    @Body() body: { points: number; isWin: boolean },
  ) {
    const result = await this.updateMemberStatsUseCase.execute({
      leagueId,
      userId,
      points: body.points,
      isWin: body.isWin
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }
    
    return result.value;
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite user to league by username' })
  async inviteUserByUsername(
    @CurrentUser() user: UserPayload,
    @Param('id') leagueId: string,
    @Body() body: { username: string },
  ) {
    const result = await this.inviteUserByUsernameUseCase.execute({
      leagueId,
      inviterId: user.id,
      username: body.username
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error);
    }

    // Send notification to invited user
    try {
      const invitedUser = await this.prisma.user.findUnique({
        where: { username: body.username },
        include: { profile: true }
      });

      if (invitedUser) {
        await this.notificationsHelper.notifyLeagueInvite({
          userId: invitedUser.id,
          leagueName: result.value.leagueName,
          inviterName: user.username,
          leagueId: leagueId,
        });
      }
    } catch (error) {
      console.error('Failed to send invite notification:', error);
      // Don't fail the invite if notification fails
    }
    
    return result.value;
  }
}