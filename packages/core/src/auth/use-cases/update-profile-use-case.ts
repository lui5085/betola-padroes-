import { IProfilesRepository } from '../repositories/profiles-repository';
import { Profile } from '../entities/profile';
import { UserNotFoundError } from './errors/user-not-found-error';
import { UserId } from '../../../shared/types/user-id';

interface UpdateProfileUseCaseRequest {
  userId: string;
  displayName?: string | null;
  bio?: string | null;
  favoriteTeam?: string | null;
  avatarUrl?: string | null;
}

interface UpdateProfileUseCaseResponse {
  profile: Profile;
}

export class UpdateProfileUseCase {
  constructor(private profilesRepository: IProfilesRepository) {}

  async execute({
    userId,
    displayName,
    bio,
    favoriteTeam,
    avatarUrl,
  }: UpdateProfileUseCaseRequest): Promise<UpdateProfileUseCaseResponse> {
    const userIdVO = new UserId(userId);
    const profile = await this.profilesRepository.findByUserId(userIdVO);

    if (!profile) {
      throw new UserNotFoundError();
    }

    if (displayName !== undefined) profile.displayName = displayName;
    if (bio !== undefined) profile.bio = bio;
    if (favoriteTeam !== undefined) profile.favoriteTeam = favoriteTeam;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

    await this.profilesRepository.save(profile);

    return { profile };
  }
} 