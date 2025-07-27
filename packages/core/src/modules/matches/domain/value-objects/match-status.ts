export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED'
}

export class MatchStatusVO {
  constructor(private readonly _value: MatchStatus) {}
  
  get value(): MatchStatus {
    return this._value;
  }
  
  isScheduled(): boolean {
    return this._value === MatchStatus.SCHEDULED;
  }
  
  isLive(): boolean {
    return this._value === MatchStatus.LIVE;
  }
  
  isFinished(): boolean {
    return this._value === MatchStatus.FINISHED;
  }
  
  isPostponed(): boolean {
    return this._value === MatchStatus.POSTPONED;
  }
  
  isCancelled(): boolean {
    return this._value === MatchStatus.CANCELLED;
  }
  
  equals(other: MatchStatusVO): boolean {
    return this._value === other._value;
  }
  
  toString(): string {
    return this._value;
  }
}