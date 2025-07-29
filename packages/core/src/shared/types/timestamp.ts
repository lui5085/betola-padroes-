// packages/core/shared/types/timestamp.ts

export class InvalidTimestampError extends Error {
  constructor(timestamp: string | Date) {
    super(`Timestamp inválido: ${timestamp}`);
    this.name = 'InvalidTimestampError';
  }
}

export class Timestamp {
  private readonly _value: Date;

  constructor(value: string | Date) {
    if (!Timestamp.isValid(value)) {
      throw new InvalidTimestampError(value);
    }
    this._value = value instanceof Date ? value : new Date(value);
  }

  get value(): Date {
    return this._value;
  }

  static isValid(value: string | Date): boolean {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  equals(other: Timestamp): boolean {
    return this._value.getTime() === other._value.getTime();
  }
} 