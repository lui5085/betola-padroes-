import { DomainEvent } from '../domain-event';
import { EventObserver } from './event-observer';
import { BetSettledEvent } from '../domain-events';

export class LeagueStatsObserver implements EventObserver {
  constructor(
    private readonly updateMemberStats: (userId: string, isWon: boolean, amount: number) => Promise<void>,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.type === 'BET_SETTLED') {
      const { userId, isWon, amount } = (event as BetSettledEvent).payload;
      await this.updateMemberStats(userId, isWon, amount);
    }
  }
}
