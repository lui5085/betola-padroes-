import { UserId } from '../../../shared/types/user-id';
import { Username } from '../../../shared/types/username';
import { Profile } from '../entities/profile';

export interface IProfilesRepository {
  create(profile: Profile): Promise<void>;
  findByUserId(userId: UserId): Promise<Profile | null>;
  findByUsername(username: Username): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
} 