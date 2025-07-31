import {
  Controller,
  Get,
  Put,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/types/user-payload';
import { NotificationsService } from './notifications.service';
import { GetUserNotificationsResponse } from '@betola/core';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
  ): Promise<GetUserNotificationsResponse> {
    const result = await this.notificationsService.getUserNotifications(
      user.id, 
      limit ? parseInt(limit) : undefined
    );
    
    return result;
  }

  @Put(':id/read')
  async markAsRead(
    @CurrentUser() user: UserPayload,
    @Param('id') notificationId: string,
  ) {
    const result = await this.notificationsService.markAsRead(notificationId);
    return { success: result.isSuccess() };
  }

  @Put('read-all')
  async markAllAsRead(@CurrentUser() user: UserPayload) {
    const result = await this.notificationsService.markAllAsRead(user.id);
    return result;
  }
}