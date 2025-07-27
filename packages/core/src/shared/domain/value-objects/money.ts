export class Money {
  private readonly _value: number;
  
  constructor(value: number) {
    if (value < 0) {
      throw new Error('Money value cannot be negative');
    }
    if (!Number.isInteger(value)) {
      throw new Error('Money value must be an integer (in cents/smallest unit)');
    }
    this._value = value;
  }
  
  get value(): number {
    return this._value;
  }
  
  add(other: Money): Money {
    return new Money(this._value + other._value);
  }
  
  subtract(other: Money): Money {
    if (this._value < other._value) {
      throw new Error('Insufficient funds');
    }
    return new Money(this._value - other._value);
  }
  
  multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(Math.floor(this._value * multiplier));
  }
  
  equals(other: Money): boolean {
    return this._value === other._value;
  }
  
  isGreaterThan(other: Money): boolean {
    return this._value > other._value;
  }
  
  isLessThan(other: Money): boolean {
    return this._value < other._value;
  }
  
  toString(): string {
    return this._value.toString();
  }
}