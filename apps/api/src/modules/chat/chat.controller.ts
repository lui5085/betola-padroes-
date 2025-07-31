import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('leagues/:leagueId/messages')
  async getLeagueMessages(
    @Param('leagueId') leagueId: string,
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('before') beforeId?: string,
  ) {
    const userId = req.user.id;
    
    // Verify user is member of the league
    const isMember = await this.chatService.isUserMemberOfLeague(userId, leagueId);
    if (!isMember) {
      throw new Error('Not a member of this league');
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    if (beforeId) {
      return await this.chatService.getMessageHistory(leagueId, beforeId, limitNum);
    } else {
      return await this.chatService.getRecentMessages(leagueId, limitNum);
    }
  }

  @Get('leagues/:leagueId/active-users')
  async getLeagueActiveUsers(
    @Param('leagueId') leagueId: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    
    // Verify user is member of the league
    const isMember = await this.chatService.isUserMemberOfLeague(userId, leagueId);
    if (!isMember) {
      throw new Error('Not a member of this league');
    }

    return await this.chatService.getLeagueActiveUsers(leagueId);
  }
}