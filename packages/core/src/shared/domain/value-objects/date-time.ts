export class DateTime {
  private readonly _value: Date;
  
  constructor(value: Date | string) {
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    this._value = date;
  }
  
  static now(): DateTime {
    return new DateTime(new Date());
  }
  
  static fromTimestamp(timestamp: number): DateTime {
    return new DateTime(new Date(timestamp));
  }

  static fromDate(date: Date): DateTime {
    return new DateTime(date);
  }
  
  get value(): Date {
    return new Date(this._value);
  }
  
  isBefore(other: DateTime): boolean {
    return this._value < other._value;
  }
  
  isAfter(other: DateTime): boolean {
    return this._value > other._value;
  }
  
  equals(other: DateTime): boolean {
    return this._value.getTime() === other._value.getTime();
  }
  
  addMinutes(minutes: number): DateTime {
    const newDate = new Date(this._value);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return new DateTime(newDate);
  }
  
  addDays(days: number): DateTime {
    const newDate = new Date(this._value);
    newDate.setDate(newDate.getDate() + days);
    return new DateTime(newDate);
  }
  
  toISOString(): string {
    return this._value.toISOString();
  }
  
  toString(): string {
    return this._value.toString();
  }
}