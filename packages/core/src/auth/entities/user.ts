import { UserId } from '../../../shared/types/user-id';
import { Username } from '../../../shared/types/username';
import { Email } from '../../../shared/types/email';
import { HashedPassword } from '../../../shared/types/hashed-password';
import { Timestamp } from '../../../shared/types/timestamp';
import { Token } from '../../../shared/types/token';
import { randomUUID } from 'crypto';

export class User {
  id: UserId;
  email: Email;
  username: Username;
  passwordHash: HashedPassword;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  emailVerified: boolean;

  passwordResetToken?: Token | null;
  passwordResetExpires?: Timestamp | null;

  // Campos para rate limiting
  loginAttempts: number;
  lastLoginAttempt?: Timestamp | null;
  lockedUntil?: Timestamp | null;

  constructor(
    params: {
      email: Email;
      username: Username;
      passwordHash: HashedPassword;
      emailVerified?: boolean;
      passwordResetToken?: Token | null;
      passwordResetExpires?: Timestamp | null;
      loginAttempts?: number;
      lastLoginAttempt?: Timestamp | null;
      lockedUntil?: Timestamp | null;
    },
    id?: UserId,
    createdAt?: Timestamp,
    updatedAt?: Timestamp,
  ) {
    this.id = id ?? new UserId(randomUUID());
    this.email = params.email;
    this.username = params.username;
    this.passwordHash = params.passwordHash;
    this.emailVerified = params.emailVerified ?? false;
    this.createdAt = createdAt ?? new Timestamp(new Date());
    this.updatedAt = updatedAt ?? new Timestamp(new Date());
    this.passwordResetToken = params.passwordResetToken;
    this.passwordResetExpires = params.passwordResetExpires;
    this.loginAttempts = params.loginAttempts ?? 0;
    this.lastLoginAttempt = params.lastLoginAttempt;
    this.lockedUntil = params.lockedUntil;
  }

  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil.value;
  }

  incrementLoginAttempts(): void {
    this.loginAttempts++;
    this.lastLoginAttempt = new Timestamp(new Date());
    
    // Bloqueia após 5 tentativas
    if (this.loginAttempts >= 5) {
      const lockTime = new Date();
      lockTime.setMinutes(lockTime.getMinutes() + 30); // 30 minutos de bloqueio
      this.lockedUntil = new Timestamp(lockTime);
    }
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lastLoginAttempt = null;
    this.lockedUntil = null;
  }

  updatePassword(newPasswordHash: HashedPassword): void {
    this.passwordHash = newPasswordHash;
    this.passwordResetToken = null;
    this.passwordResetExpires = null;
    this.updatedAt = new Timestamp(new Date());
  }
}