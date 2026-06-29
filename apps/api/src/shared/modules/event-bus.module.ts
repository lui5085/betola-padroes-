import { Global, Module } from '@nestjs/common';
import { InMemoryEventBus } from '@betola/adapters/events/in-memory-event-bus';
import { NotificationObserver } from '@betola/core/shared/domain/events/observers/notification-observer';
import { LeagueStatsObserver } from '@betola/core/shared/domain/events/observers/league-stats-observer';
import { EventBus } from '@betola/core/shared/domain/events/event-bus';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { NotificationsService } from '../../modules/notifications/notifications.service';

@Global()
@Module({
  imports: [NotificationsModule],
  providers: [
    {
      provide: 'EventBus',
      useFactory: (notificationsService: NotificationsService): EventBus => {
        const bus = new InMemoryEventBus();

        bus.subscribe(
          'BET_SETTLED',
          new NotificationObserver(async (data) => {
            await notificationsService.createNotification(data);
          }),
        );

        bus.subscribe(
          'BET_SETTLED',
          new LeagueStatsObserver(async (userId, isWon, amount) => {
            console.log(
              `[LeagueStats] Updating stats for user ${userId}: ` +
              `${isWon ? 'WON' : 'LOST'} ${amount} betoletas`,
            );
          }),
        );

        console.log('[EventBus] InMemoryEventBus created — 2 observers subscribed to BET_SETTLED');
        return bus;
      },
      inject: [NotificationsService],
    },
  ],
  exports: ['EventBus'],
})
export class EventBusModule {}
