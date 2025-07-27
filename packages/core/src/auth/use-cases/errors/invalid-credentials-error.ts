export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountLockedError extends Error {
  constructor() {
    super('Account is locked due to too many failed login attempts');
    this.name = 'AccountLockedError';
  }
}
