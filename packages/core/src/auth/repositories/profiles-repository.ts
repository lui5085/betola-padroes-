import { UserId } from '../../../shared/types/user-id';
import { Profile } from '../entities/profile';

export interface IProfilesRepository {
  create(profile: Profile): Promise<void>;
  findByUserId(userId: UserId): Promise<Profile | null>;
  findByDisplayName(displayName: string): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
} 