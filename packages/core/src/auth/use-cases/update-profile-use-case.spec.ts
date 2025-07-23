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
  username: new Username('usuario1'),
  firstName: 'João',
  lastName: 'Silva',
  avatarUrl: null,
});

const makeProfilesRepository = (): jest.Mocked<IProfilesRepository> => ({
  create: jest.fn(),
  findByUserId: jest.fn(),
  findByUsername: jest.fn(),
  save: jest.fn(),
});

describe('UpdateProfileUseCase', () => {
  it('deve atualizar o perfil com sucesso', async () => {
    const profilesRepository = makeProfilesRepository();
    const useCase = new UpdateProfileUseCase(profilesRepository);
    const profile = new Profile(defaultProfileParams());
    profilesRepository.findByUserId.mockResolvedValue(profile);
    profilesRepository.findByUsername.mockResolvedValue(null);
    await useCase.execute({
      userId: profile.userId.value,
      username: 'novo_usuario',
      firstName: 'Novo',
      lastName: 'Nome',
      avatarUrl: 'url',
    });
    expect(profilesRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      username: expect.any(Username),
      firstName: 'Novo',
      lastName: 'Nome',
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

  it('deve lançar UsernameAlreadyExistsError se username já existir', async () => {
    const profilesRepository = makeProfilesRepository();
    const useCase = new UpdateProfileUseCase(profilesRepository);
    const profile = new Profile(defaultProfileParams());
    profilesRepository.findByUserId.mockResolvedValue(profile);
    // Simula que o username 'usuario2' já existe
    profilesRepository.findByUsername.mockResolvedValue(new Profile(defaultProfileParams(uuidB)));
    await expect(useCase.execute({
      userId: profile.userId.value,
      username: 'usuario2',
    })).rejects.toBeInstanceOf(UsernameAlreadyExistsError);
  });
}); 