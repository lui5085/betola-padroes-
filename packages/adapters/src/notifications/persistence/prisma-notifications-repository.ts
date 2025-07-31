import { PrismaClient } from '@prisma/client';
import { Notification } from '@betola/core/modules/notifications/domain/entities/notification';
import { NotificationsRepository } from '@betola/core/modules/notifications/domain/repositories/notifications-repository';

export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(notification: Notification): Promise<void> {
    await this.prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data ? JSON.stringify(notification.data) : null,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    });
  }

  async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications.map(n => 
      Notification.fromPersistence({
        id: n.id,
        userId: n.userId,
        type: n.type as any,
        title: n.title,
        message: n.message,
        data: n.data ? JSON.parse(n.data) : null,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })
    );
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        userId,
        isRead: false 
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(n => 
      Notification.fromPersistence({
        id: n.id,
        userId: n.userId,
        type: n.type as any,
        title: n.title,
        message: n.message,
        data: n.data ? JSON.parse(n.data) : null,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsReadByUserId(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: { 
        userId,
        isRead: false 
      },
    });
  }

  async delete(notificationId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}