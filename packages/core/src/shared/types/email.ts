// packages/core/shared/types/email.ts

export class InvalidEmailError extends Error {
    constructor(email: string) {
      super(`Email inválido: ${email}`);
      this.name = 'InvalidEmailError';
    }
  }
  
  export class Email {
    private readonly _value: string;
  
    constructor(value: string) {
      if (!Email.isValid(value)) {
        throw new InvalidEmailError(value);
      }
      this._value = value;
    }
  
    get value(): string {
      return this._value;
    }
  
    static isValid(email: string): boolean {
      // Regex simples, pode ser melhorado conforme necessidade
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  
    equals(other: Email): boolean {
      return this._value === other._value;
    }
  }