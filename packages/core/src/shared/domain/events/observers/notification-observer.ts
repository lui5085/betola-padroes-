import { DomainEvent } from '../domain-event';
import { EventObserver } from './event-observer';
import { BetSettledEvent } from '../domain-events';

export class NotificationObserver implements EventObserver {
  constructor(
    private readonly createNotification: (data: {
      userId: string;
      type: 'BET_WON' | 'BET_LOST' | 'BET_SETTLED';
      title: string;
      message: string;
      data?: any;
    }) => Promise<void>,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.type === 'BET_SETTLED') {
      const { userId, isWon, amount, potentialWin, betId } = (event as BetSettledEvent).payload;

      await this.createNotification({
        userId,
        type: isWon ? 'BET_WON' : 'BET_LOST',
        title: isWon ? '🎉 Aposta Ganha!' : '😞 Aposta Perdida',
        message: isWon
          ? `Você ganhou ${potentialWin.toFixed(2)} betoletas!`
          : `Você perdeu ${amount.toFixed(2)} betoletas.`,
        data: { betId, amount, potentialWin },
      });
    }
  }
}
