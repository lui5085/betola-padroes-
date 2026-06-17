import { DomainEvent } from './domain-event';

export class BetPlacedEvent implements DomainEvent {
  readonly type = 'BET_PLACED';
  readonly timestamp: Date;

  constructor(public readonly payload: {
    betId: string;
    userId: string;
    amount: number;
    totalOdds: number;
    potentialWin: number;
    selectionsCount: number;
  }) {
    this.timestamp = new Date();
  }
}

export class BetSettledEvent implements DomainEvent {
  readonly type = 'BET_SETTLED';
  readonly timestamp: Date;

  constructor(public readonly payload: {
    betId: string;
    userId: string;
    isWon: boolean;
    amount: number;
    potentialWin: number;
  }) {
    this.timestamp = new Date();
  }
}
