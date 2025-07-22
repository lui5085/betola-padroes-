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
    props: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>,
    id?: UserId,
    createdAt?: Timestamp,
    updatedAt?: Timestamp,
  ) {
    this.id = id ?? new UserId(randomUUID());
    this.userId = props.userId;
    this.username = props.username;
    this.firstName = props.firstName ?? null;
    this.lastName = props.lastName ?? null;
    this.avatarUrl = props.avatarUrl ?? null;
    this.createdAt = createdAt ?? new Timestamp(new Date());
    this.updatedAt = updatedAt ?? new Timestamp(new Date());
  }
} 