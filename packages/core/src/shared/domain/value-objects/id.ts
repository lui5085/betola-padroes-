export abstract class ID<T> {
  private readonly _value: string;
  
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error(`${this.constructor.name} cannot be empty`);
    }
    this._value = value;
  }
  
  get value(): string {
    return this._value;
  }
  
  equals(other: ID<T>): boolean {
    return this._value === other._value;
  }
  
  toString(): string {
    return this._value;
  }
}