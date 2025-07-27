import { Profile } from '../entities/profile';
import { IProfilesRepository } from '../repositories/profiles-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { UserId } from '../../../shared/types/user-id';

export interface GetProfileUseCaseResponse {
  profile: Profile;
}

export class GetProfileUseCase {
  constructor(private profilesRepository: IProfilesRepository) {}

  async execute(userId: string): Promise<GetProfileUseCaseResponse> {
    const userIdVO = new UserId(userId);
    const profile = await this.profilesRepository.findByUserId(userIdVO);

    if (!profile) {
      throw new UserNotFoundError();
    }

    return { profile };
  }
} 