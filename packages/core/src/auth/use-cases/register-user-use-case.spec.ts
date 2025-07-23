import { RegisterUserUseCase } from './register-user-use-case';
import { IUsersRepository } from '../repositories/users-repository';
import { IProfilesRepository } from '../repositories/profiles-repository';
import { IHasher } from '../services/hasher';
import { User } from '../entities/user';
import { Profile } from '../entities/profile';
import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';
import { Username } from '../../../shared/types/username';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { EmailAlreadyExistsError } from './errors/email-already-exists-error';
import { UsernameAlreadyExistsError } from './errors/username-already-exists-error';

describe('RegisterUserUseCase', () => {
  const email = new Email('user@example.com');
  const password = new Password('Senha123!');
  const username = new Username('joaovitor');
  const hashedPassword = new Password('Senha123!');
  const user = new User({ email, password: hashedPassword });
  const profile = new Profile({ userId: user.id, username, firstName: 'João', lastName: 'Vitor', avatarUrl: null });

  let usersRepository: jest.Mocked<IUsersRepository>;
  let profilesRepository: jest.Mocked<IProfilesRepository>;
  let hasher: jest.Mocked<IHasher>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByPasswordResetToken: jest.fn(),
      save: jest.fn(),
    };
    profilesRepository = {
      findByUsername: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    hasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    useCase = new RegisterUserUseCase(usersRepository, profilesRepository, hasher);
  });

  it('deve registrar usuário com sucesso', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    profilesRepository.findByUsername.mockResolvedValue(null);
    hasher.hash.mockResolvedValue(password.value);
    usersRepository.create.mockResolvedValue();
    profilesRepository.create.mockResolvedValue();

    const result = await useCase.execute({
      email: email.value,
      password: password.value,
      username: username.value,
      firstName: 'João',
      lastName: 'Vitor',
    });
    expect(result.user.email.value).toBe(email.value);
    expect(result.profile.username.value).toBe(username.value);
    expect(usersRepository.create).toHaveBeenCalled();
    expect(profilesRepository.create).toHaveBeenCalled();
  });

  it('deve falhar se email já existir', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    await expect(
      useCase.execute({
        email: email.value,
        password: password.value,
        username: username.value,
      })
    ).rejects.toThrow(EmailAlreadyExistsError);
  });

  it('deve falhar se username já existir', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    profilesRepository.findByUsername.mockResolvedValue(profile);
    await expect(
      useCase.execute({
        email: email.value,
        password: password.value,
        username: username.value,
      })
    ).rejects.toThrow(UsernameAlreadyExistsError);
  });
}); 