export class HashedPassword {
    private readonly _value: string;
  
    constructor(value: string) {
      this.validate(value);
      this._value = value;
    }
  
    private validate(value: string): void {
      if (!value) {
        throw new Error('Hashed password is required');
      }
  
      if (value.length < 20) {
        throw new Error('Invalid password hash');
      }
    }
  
    get value(): string {
      return this._value;
    }
  }