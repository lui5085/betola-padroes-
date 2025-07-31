export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  VOID = 'VOID',
  CANCELLED = 'CANCELLED',
  PARTIALLY_WON = 'PARTIALLY_WON'
}

export class BetStatusVO {
  constructor(private readonly _value: BetStatus) {}
  
  get value(): BetStatus {
    return this._value;
  }
  
  isPending(): boolean {
    return this._value === BetStatus.PENDING;
  }
  
  isSettled(): boolean {
    return [BetStatus.WON, BetStatus.LOST, BetStatus.VOID, BetStatus.PARTIALLY_WON].includes(this._value);
  }
  
  isWinning(): boolean {
    return [BetStatus.WON, BetStatus.PARTIALLY_WON].includes(this._value);
  }
  
  isWon(): boolean {
    return this._value === BetStatus.WON;
  }
  
  isLost(): boolean {
    return this._value === BetStatus.LOST;
  }
  
  equals(other: BetStatusVO): boolean {
    return this._value === other._value;
  }
  
  toString(): string {
    return this._value;
  }
}