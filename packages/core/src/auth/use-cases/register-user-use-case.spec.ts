import { RegisterUserUseCase } from './register-user-use-case';
import { IUsersRepository } from '../repositories/users-repository';
import { IProfilesRepository } from '../repositories/profiles-repository';
import { IHasher } from '../services/hasher';
import { User } from '../entities/user';
import { Profile } from '../entities/profile';
import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';
import { HashedPassword } from '../../../shared/types/hashed-password';
import { Username } from '../../../shared/types/username';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { EmailAlreadyExistsError } from './errors/email-already-exists-error';
import { UsernameAlreadyExistsError } from './errors/username-already-exists-error';

describe('RegisterUserUseCase', () => {
  const email = new Email('user@example.com');
  const password = new Password('Senha123!');
  const username = new Username('joaovitor');
  const hashedPassword = new HashedPassword('$2b$10$hashedpassword');
  const user = new User({ email, username, passwordHash: hashedPassword });
  const profile = new Profile({ userId: user.id, displayName: 'João Vitor', avatarUrl: null });

  let usersRepository: jest.Mocked<IUsersRepository>;
  let profilesRepository: jest.Mocked<IProfilesRepository>;
  let hasher: jest.Mocked<IHasher>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByPasswordResetToken: jest.fn(),
      save: jest.fn(),
      createWithProfile: jest.fn(),
    };
    profilesRepository = {
      findByUserId: jest.fn(),
      findByDisplayName: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<IProfilesRepository>;
    hasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    useCase = new RegisterUserUseCase(usersRepository, profilesRepository, hasher);
  });

  it('deve registrar usuário com sucesso', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.findByUsername.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('$2b$10$hashedpassword');
    usersRepository.createWithProfile.mockResolvedValue();

    const result = await useCase.execute({
      email: email.value,
      password: password.value,
      username: username.value,
      firstName: 'João',
      lastName: 'Vitor',
    });
    expect(result.isSuccess()).toBe(true);
    expect(result.value.user.email.value).toBe(email.value);
    expect(result.value.profile.displayName).toBe('João Vitor');
    expect(usersRepository.createWithProfile).toHaveBeenCalled();
  });

  it('deve falhar se email já existir', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    const result = await useCase.execute({
      email: email.value,
      password: password.value,
      username: username.value,
    });
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Email already registered');
  });

  it('deve falhar se username já existir', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.findByUsername.mockResolvedValue(user);
    const result = await useCase.execute({
      email: email.value,
      password: password.value,
      username: username.value,
    });
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Username already taken');
  });
}); 