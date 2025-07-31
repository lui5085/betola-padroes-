import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateNotificationUseCase } from '@betola/core/modules/notifications/application/use-cases/create-notification';
import { GetUserNotificationsUseCase } from '@betola/core/modules/notifications/application/use-cases/get-user-notifications';
import { MarkNotificationReadUseCase } from '@betola/core/modules/notifications/application/use-cases/mark-notification-read';
import { PrismaNotificationsRepository } from '@betola/adapters/notifications/persistence/prisma-notifications-repository';
import { GetUserNotificationsResponse } from '@betola/core';

@Injectable()
export class NotificationsService {
  private createNotificationUseCase: CreateNotificationUseCase;
  private getUserNotificationsUseCase: GetUserNotificationsUseCase;
  private markNotificationReadUseCase: MarkNotificationReadUseCase;
  private notificationsRepository: PrismaNotificationsRepository;

  constructor(private prismaService: PrismaService) {
    this.notificationsRepository = new PrismaNotificationsRepository(this.prismaService);
    this.createNotificationUseCase = new CreateNotificationUseCase(this.notificationsRepository);
    this.getUserNotificationsUseCase = new GetUserNotificationsUseCase(this.notificationsRepository);
    this.markNotificationReadUseCase = new MarkNotificationReadUseCase(this.notificationsRepository);
  }

  async createNotification(data: {
    userId: string;
    type: 'LEAGUE_INVITE' | 'BET_SETTLED' | 'LEAGUE_JOINED' | 'BET_WON' | 'BET_LOST';
    title: string;
    message: string;
    data?: any;
  }) {
    return this.createNotificationUseCase.execute(data);
  }

  async getUserNotifications(userId: string, limit?: number): Promise<GetUserNotificationsResponse> {
    const result = await this.getUserNotificationsUseCase.execute({ userId, limit });
    return result.isSuccess() ? result.value : { notifications: [], unreadCount: 0 };
  }

  async markAsRead(notificationId: string) {
    return this.markNotificationReadUseCase.execute({ notificationId });
  }

  async markAllAsRead(userId: string) {
    try {
      await this.notificationsRepository.markAllAsReadByUserId(userId);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}