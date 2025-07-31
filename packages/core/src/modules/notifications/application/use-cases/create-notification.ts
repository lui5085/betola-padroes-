import { Result } from '../../../../shared/application/result';
import { Notification } from '../../domain/entities/notification';
import { NotificationsRepository } from '../../domain/repositories/notifications-repository';

interface CreateNotificationRequest {
  userId: string;
  type: 'LEAGUE_INVITE' | 'BET_SETTLED' | 'LEAGUE_JOINED' | 'BET_WON' | 'BET_LOST';
  title: string;
  message: string;
  data?: any;
}

export class CreateNotificationUseCase {
  constructor(
    private notificationsRepository: NotificationsRepository
  ) {}

  async execute(request: CreateNotificationRequest): Promise<Result<Notification>> {
    try {
      const notification = Notification.create({
        userId: request.userId,
        type: request.type,
        title: request.title,
        message: request.message,
        data: request.data,
      });

      await this.notificationsRepository.create(notification);

      return Result.success(notification);
    } catch (error) {
      return Result.failure('Failed to create notification');
    }
  }
}