import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/types/user-payload';
import { AdminService } from './admin.service';
import { SyncBrasileraoDataUseCase } from '@betola/core';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly syncBrasileraoDataUseCase: SyncBrasileraoDataUseCase,
  ) {}

  @Get('bets/pending')
  async getPendingBets(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.getPendingBets({
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get('bets/:id')
  async getBetDetails(@Param('id') betId: string) {
    return this.adminService.getBetDetails(betId);
  }

  @Post('bets/:id/settle')
  async settleBet(
    @CurrentUser() admin: UserPayload,
    @Param('id') betId: string,
    @Body() settleData: { 
      status: 'WON' | 'LOST';
      reason?: string;
    },
  ) {
    return this.adminService.settleBetManually({
      betId,
      status: settleData.status,
      adminId: admin.id,
      reason: settleData.reason,
    });
  }

  @Post('bets/settle-multiple')
  async settleMultipleBets(
    @CurrentUser() admin: UserPayload,
    @Body() settleData: {
      betIds: string[];
      status: 'WON' | 'LOST';
      reason?: string;
    },
  ) {
    return this.adminService.settleMultipleBets({
      betIds: settleData.betIds,
      status: settleData.status,
      adminId: admin.id,
      reason: settleData.reason,
    });
  }

  @Get('matches')
  async getMatches(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.getMatches({
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Put('matches/:id/result')
  async updateMatchResult(
    @CurrentUser() admin: UserPayload,
    @Param('id') matchId: string,
    @Body() resultData: {
      homeScore: number;
      awayScore: number;
      status: string;
    },
  ) {
    return this.adminService.updateMatchResult({
      matchId,
      ...resultData,
      adminId: admin.id,
    });
  }

  @Get('stats')
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Post('sync/brasileirao')
  async syncBrasileirao(@CurrentUser() admin: UserPayload) {
    const result = await this.syncBrasileraoDataUseCase.execute({
      forceRefresh: true
    });

    if (result.isSuccess()) {
      return {
        success: true,
        message: 'Sincronização do Brasileirão realizada com sucesso',
        data: result.value
      };
    } else {
      return {
        success: false,
        message: 'Erro ao sincronizar dados do Brasileirão',
        error: result.error
      };
    }
  }
}