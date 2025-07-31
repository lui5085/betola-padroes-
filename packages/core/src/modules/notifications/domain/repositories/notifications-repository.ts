import { Notification } from '../entities/notification';

export interface NotificationsRepository {
  create(notification: Notification): Promise<void>;
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsReadByUserId(userId: string): Promise<void>;
  countUnreadByUserId(userId: string): Promise<number>;
  delete(notificationId: string): Promise<void>;
}