export class Odds {
  private static readonly MIN_ODDS = 1.01;
  private static readonly MAX_ODDS = 1000;
  
  constructor(private readonly _value: number) {
    if (_value < Odds.MIN_ODDS || _value > Odds.MAX_ODDS) {
      throw new Error(`Odds must be between ${Odds.MIN_ODDS} and ${Odds.MAX_ODDS}`);
    }
    
    if (Number.isNaN(_value) || !Number.isFinite(_value)) {
      throw new Error('Odds must be a valid number');
    }
  }
  
  get value(): number {
    return Number(this._value.toFixed(2));
  }
  
  multiply(other: Odds): Odds {
    return new Odds(this._value * other._value);
  }
  
  equals(other: Odds): boolean {
    return Math.abs(this._value - other._value) < 0.01;
  }
  
  toString(): string {
    return this._value.toFixed(2);
  }
}