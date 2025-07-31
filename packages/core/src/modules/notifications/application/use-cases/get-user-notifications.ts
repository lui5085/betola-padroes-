import { Result } from '../../../../shared/application/result';
import { Notification } from '../../domain/entities/notification';
import { NotificationsRepository } from '../../domain/repositories/notifications-repository';

interface GetUserNotificationsRequest {
  userId: string;
  limit?: number;
}

export interface GetUserNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export class GetUserNotificationsUseCase {
  constructor(
    private notificationsRepository: NotificationsRepository
  ) {}

  async execute(request: GetUserNotificationsRequest): Promise<Result<GetUserNotificationsResponse>> {
    try {
      const [notifications, unreadCount] = await Promise.all([
        this.notificationsRepository.findByUserId(request.userId, request.limit),
        this.notificationsRepository.countUnreadByUserId(request.userId)
      ]);

      return Result.success({
        notifications,
        unreadCount
      });
    } catch (error) {
      return Result.failure('Failed to get user notifications');
    }
  }
}