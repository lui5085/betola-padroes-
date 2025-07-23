// packages/core/shared/types/password.ts

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(`Senha inválida: ${message}`);
    this.name = 'InvalidPasswordError';
  }
}

export class Password {
  private readonly _value: string;

  constructor(value: string) {
    if (!Password.isValid(value)) {
      throw new InvalidPasswordError('A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static isValid(password: string): boolean {
    // Regras de validação:
    // - Mínimo 8 caracteres
    // - Pelo menos uma letra maiúscula
    // - Pelo menos uma letra minúscula
    // - Pelo menos um número
    // - Pelo menos um caractere especial
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    // Corrigido: regex para qualquer caractere especial comum
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\[\]\\/;'`~_+=-]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  equals(other: Password): boolean {
    return this._value === other._value;
  }

  // Método para verificar se a senha é forte o suficiente
  isStrong(): boolean {
    // Senha é considerada forte se tiver mais de12acteres
    return this._value.length >=12;
  }

  // Método para obter o comprimento da senha (útil para validações adicionais)
  get length(): number {
    return this._value.length;
  }
} 