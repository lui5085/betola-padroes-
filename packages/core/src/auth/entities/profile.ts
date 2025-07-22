import { UserId } from '../../../shared/types/user-id';
import { Username } from '../../../shared/types/username';
import { Timestamp } from '../../../shared/types/timestamp';
import { randomUUID } from 'crypto';

export class Profile {
  id: UserId;
  userId: UserId;
  username: Username;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  constructor(
    params: {
      userId: UserId;
      username: Username;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    },
    id?: UserId,
    createdAt?: Timestamp,
    updatedAt?: Timestamp,
  ) {
    this.id = id ?? new UserId(randomUUID());
    this.userId = params.userId;
    this.username = params.username;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.avatarUrl = params.avatarUrl;
    this.createdAt = createdAt ?? new Timestamp(new Date());
    this.updatedAt = updatedAt ?? new Timestamp(new Date());
  }
} 