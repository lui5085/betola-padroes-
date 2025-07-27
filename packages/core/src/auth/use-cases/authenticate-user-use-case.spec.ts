import { AuthenticateUserUseCase } from './authenticate-user-use-case';
import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { User } from '../entities/user';
import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';
import { HashedPassword } from '../../../shared/types/hashed-password';
import { UserId } from '../../../shared/types/user-id';
import { Username } from '../../../shared/types/username';
import { Timestamp } from '../../../shared/types/timestamp';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';

describe('AuthenticateUserUseCase', () => {
  const email = new Email('user@example.com');
  const username = new Username('testuser');
  const password = new Password('Senha123!');
  const hashedPassword = new HashedPassword('$2b$10$hashedpassword');
  const user = new User({ email, username, passwordHash: hashedPassword });

  let usersRepository: jest.Mocked<IUsersRepository>;
  let hasher: jest.Mocked<IHasher>;
  let useCase: AuthenticateUserUseCase;

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
    hasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    useCase = new AuthenticateUserUseCase(usersRepository, hasher);
  });

  it('deve autenticar com sucesso', async () => {
    // Set user as email verified for success case
    user.emailVerified = true;
    usersRepository.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({ email: email.value, password: password.value });
    expect(result.isSuccess()).toBe(true);
    expect(result.value.user).toBe(user);
    expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(hasher.compare).toHaveBeenCalledWith(password.value, user.passwordHash.value);
  });

  it('deve falhar se usuário não existir', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    const result = await useCase.execute({ email: email.value, password: password.value });
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBe('Invalid credentials');
  });

  it('deve falhar se senha estiver errada', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(false);
    const result = await useCase.execute({ email: email.value, password: password.value });
    expect(result.isFailure()).toBe(true);
    expect(result.error).toContain('Invalid credentials');
  });
}); 