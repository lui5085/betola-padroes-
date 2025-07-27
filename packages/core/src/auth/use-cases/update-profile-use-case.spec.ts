import { UpdateProfileUseCase } from './update-profile-use-case';
import { IProfilesRepository } from '../repositories/profiles-repository';
import { Profile } from '../entities/profile';
import { UserNotFoundError } from './errors/user-not-found-error';
import { UsernameAlreadyExistsError } from './errors/username-already-exists-error';
import { UserId } from '../../../shared/types/user-id';
import { Username } from '../../../shared/types/username';

const uuidA = '550e8400-e29b-41d4-a716-446655440000';
const uuidB = '550e8400-e29b-41d4-a716-446655440001';
const defaultProfileParams = (userId?: string) => ({
  userId: new UserId(userId || uuidA),
  displayName: 'João Silva',
  avatarUrl: null,
});

const makeProfilesRepository = (): jest.Mocked<IProfilesRepository> => ({
  create: jest.fn(),
  findByUserId: jest.fn(),
  findByDisplayName: jest.fn(),
  save: jest.fn(),
} as jest.Mocked<IProfilesRepository>);

describe('UpdateProfileUseCase', () => {
  it('deve atualizar o perfil com sucesso', async () => {
    const profilesRepository = makeProfilesRepository();
    const useCase = new UpdateProfileUseCase(profilesRepository);
    const profile = new Profile(defaultProfileParams());
    profilesRepository.findByUserId.mockResolvedValue(profile);
    // Username validation removed - no longer in Profile entity
    await useCase.execute({
      userId: profile.userId.value,
      displayName: 'Novo Nome',
      avatarUrl: 'url',
    });
    expect(profilesRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      displayName: 'Novo Nome',
      avatarUrl: 'url',
    }));
  });

  it('deve lançar UserNotFoundError se perfil não existir', async () => {
    const profilesRepository = makeProfilesRepository();
    const useCase = new UpdateProfileUseCase(profilesRepository);
    profilesRepository.findByUserId.mockResolvedValue(null);
    await expect(useCase.execute({ userId: uuidA }))
      .rejects.toBeInstanceOf(UserNotFoundError);
  });

  // Username duplication test removed since username is no longer part of profile
  // it('deve lançar UsernameAlreadyExistsError se username já existir', async () => {
  //   const profilesRepository = makeProfilesRepository();
  //   const useCase = new UpdateProfileUseCase(profilesRepository);
  //   const profile = new Profile(defaultProfileParams());
  //   profilesRepository.findByUserId.mockResolvedValue(profile);
  //   await expect(useCase.execute({
  //     userId: profile.userId.value,
  //   })).rejects.toBeInstanceOf(UsernameAlreadyExistsError);
  // });
}); 