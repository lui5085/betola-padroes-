import { IProfilesRepository } from '../repositories/profiles-repository';
import { Profile } from '../entities/profile';
import { UserNotFoundError } from './errors/user-not-found-error';
import { UsernameAlreadyExistsError } from './errors/username-already-exists-error';
import { UserId } from '../../../shared/types/user-id';
import { Username } from '../../../shared/types/username';

interface UpdateProfileUseCaseRequest {
  userId: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

interface UpdateProfileUseCaseResponse {
  profile: Profile;
}

export class UpdateProfileUseCase {
  constructor(private profilesRepository: IProfilesRepository) {}

  async execute({
    userId,
    username,
    firstName,
    lastName,
    avatarUrl,
  }: UpdateProfileUseCaseRequest): Promise<UpdateProfileUseCaseResponse> {
    const userIdVO = new UserId(userId);
    const profile = await this.profilesRepository.findByUserId(userIdVO);

    if (!profile) {
      throw new UserNotFoundError();
    }

    if (username && !profile.username.equals(new Username(username))) {
      const usernameVO = new Username(username);
      const existing = await this.profilesRepository.findByUsername(usernameVO);
      if (existing) {
        throw new UsernameAlreadyExistsError();
      }
      profile.username = usernameVO;
    }

    if (firstName !== undefined) profile.firstName = firstName;
    if (lastName !== undefined) profile.lastName = lastName;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

    await this.profilesRepository.save(profile);

    return { profile };
  }
} 