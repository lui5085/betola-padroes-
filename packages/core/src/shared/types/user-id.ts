// packages/core/shared/types/user-id.ts

export class InvalidUserIdError extends Error {
  constructor(userId: string) {
    super(`UserId inválido: ${userId}`);
    this.name = 'InvalidUserIdError';
  }
}

export class UserId {
  private readonly _value: string;

  constructor(value: string) {
    if (!UserId.isValid(value)) {
      throw new InvalidUserIdError(value);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  static isValid(userId: string): boolean {
    // Regex para UUID v4
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(userId);
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }
} 