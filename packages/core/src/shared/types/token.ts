// packages/core/shared/types/token.ts

export class InvalidTokenError extends Error {
  constructor(token: string) {
    super(`Token inválido: ${token}`);
    this.name = 'InvalidTokenError';
  }
}

export class Token {
  private readonly _value: string;

  constructor(value: string) {
    if (!Token.isValid(value)) {
      throw new InvalidTokenError(value);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static isValid(token: string): boolean {
    // Token padrão: 64 caracteres hexadecimais (gerado por randomBytes(32).toString('hex'))
    return /^[a-f0-9]{64}$/i.test(token);
  }

  equals(other: Token): boolean {
    return this._value === other._value;
  }
} 