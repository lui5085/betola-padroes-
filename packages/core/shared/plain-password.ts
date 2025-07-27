export class PlainPassword {
    private readonly _value: string;
  
    constructor(value: string) {
      this.validate(value);
      this._value = value;
    }
  
    private validate(value: string): void {
      if (!value) {
        throw new Error('Password is required');
      }
  
      if (value.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
  
      if (value.length > 100) {
        throw new Error('Password must be less than 100 characters long');
      }
  
      // Adicionar mais validações conforme necessário
      if (!/(?=.*[a-z])/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
  
      if (!/(?=.*[A-Z])/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
  
      if (!/(?=.*\d)/.test(value)) {
        throw new Error('Password must contain at least one number');
      }
    }
  
    get value(): string {
      return this._value;
    }
  }
  