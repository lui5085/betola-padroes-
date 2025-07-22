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
    props: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    id?: UserId,
    createdAt?: Timestamp,
    updatedAt?: Timestamp,
  ) {
    this.id = id ?? new UserId(randomUUID());
    this.email = props.email;
    this.password = props.password;
    this.createdAt = createdAt ?? new Timestamp(new Date());
    this.updatedAt = updatedAt ?? new Timestamp(new Date());
    this.passwordResetToken = props.passwordResetToken;
    this.passwordResetExpires = props.passwordResetExpires;
  }
} 