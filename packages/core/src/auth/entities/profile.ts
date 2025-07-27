import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { randomUUID } from 'crypto';

export class Profile {
  id: UserId;
  userId: UserId;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  favoriteTeam: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  constructor(
    params: {
      userId: UserId;
      displayName?: string | null;
      avatarUrl?: string | null;
      bio?: string | null;
      favoriteTeam?: string | null;
    },
    id?: UserId,
    createdAt?: Timestamp,
    updatedAt?: Timestamp,
  ) {
    this.id = id ?? new UserId(randomUUID());
    this.userId = params.userId;
    this.displayName = params.displayName ?? null;
    this.avatarUrl = params.avatarUrl ?? null;
    this.bio = params.bio ?? null;
    this.favoriteTeam = params.favoriteTeam ?? null;
    this.createdAt = createdAt ?? new Timestamp(new Date());
    this.updatedAt = updatedAt ?? new Timestamp(new Date());
  }
} 