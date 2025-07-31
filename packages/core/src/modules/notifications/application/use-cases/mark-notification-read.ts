import { Result } from '../../../../shared/application/result';
import { NotificationsRepository } from '../../domain/repositories/notifications-repository';

interface MarkNotificationReadRequest {
  notificationId: string;
}

export class MarkNotificationReadUseCase {
  constructor(
    private notificationsRepository: NotificationsRepository
  ) {}

  async execute(request: MarkNotificationReadRequest): Promise<Result<void>> {
    try {
      await this.notificationsRepository.markAsRead(request.notificationId);
      return Result.success(undefined);
    } catch (error) {
      return Result.failure('Failed to mark notification as read');
    }
  }
}