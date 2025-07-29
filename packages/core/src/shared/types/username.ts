// packages/core/shared/types/username.ts

export class InvalidUsernameError extends Error {
  constructor(message: string) {
    super(`Nome de usuário inválido: ${message}`);
    this.name = 'InvalidUsernameError';
  }
}

export class Username {
  private readonly _value: string;

  constructor(value: string) {
    if (!Username.isValid(value)) {
      throw new InvalidUsernameError('O nome de usuário deve ter entre 3 e 20 caracteres, apenas letras, números, hífen e underscore.');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static isValid(username: string): boolean {  // Regras de validação:
    // - Entre 320 caracteres
    // - Apenas letras (a-z, A-Z), números (0-9), hífen (-) e underscore (_)
    // - Não pode começar ou terminar com hífen ou underscore
    // - Não pode ter hífen ou underscore consecutivos
    const minLength = 3;
    const maxLength = 20;
    if (username.length < minLength || username.length > maxLength) {
      return false;
    }

    // Regex para validar formato: apenas letras, números, hífen e underscore
    const validFormat = /^[a-zA-Z0-9_-]+$/.test(username);
    
    if (!validFormat) {
      return false;
    }

    // Não pode começar ou terminar com hífen ou underscore
    if (/^[-_]|[-_]$/.test(username)) {
      return false;
    }

    // Não pode ter hífen ou underscore consecutivos
    if (/[-_]{2}/.test(username)) {
      return false;
    }

    return true;
  }

  equals(other: Username): boolean {
    return this._value === other._value;
  }

  // Método para obter o comprimento do username
  get length(): number {
    return this._value.length;
  }

  // Método para verificar se o username é considerado longo
  isLong(): boolean {
    return this._value.length >= 15;
  }

  // Método para obter o username em lowercase (útil para comparações)
  toLowerCase(): string {
    return this._value.toLowerCase();
  }
} 