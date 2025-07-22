import { UserId } from '../../../shared/types/user-id';
import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';
import { Timestamp } from '../../../shared/types/timestamp';
import { Token } from '../../../shared/types/token';
import { randomUUID } from 'crypto';

export class User {
  id: UserId;
  email: Email;
  password: Password;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  passwordResetToken?: Token | null;
  passwordResetExpires?: Timestamp | null;

  constructor(
    params: {
      email: Email;
      password: Password;
      passwordResetToken?: Token | null;
      passwordResetExpires?: Timestamp | null;
    },
    id?: UserId,
    createdAt?: Timestamp,
    updatedAt?: Timestamp,
  ) {
    this.id = id ?? new UserId(randomUUID());
    this.email = params.email;
    this.password = params.password;
    this.createdAt = createdAt ?? new Timestamp(new Date());
    this.updatedAt = updatedAt ?? new Timestamp(new Date());
    this.passwordResetToken = params.passwordResetToken;
    this.passwordResetExpires = params.passwordResetExpires;
  }
} 