import { AuthenticateUserUseCase } from './authenticate-user-use-case';
import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { User } from '../entities/user';
import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';

describe('AuthenticateUserUseCase', () => {
  const email = new Email('user@example.com');
  const password = new Password('Senha123!');
  const hashedPassword = new Password('Senha123!');
  const user = new User({ email, password: hashedPassword });

  let usersRepository: jest.Mocked<IUsersRepository>;
  let hasher: jest.Mocked<IHasher>;
  let useCase: AuthenticateUserUseCase;

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByPasswordResetToken: jest.fn(),
      save: jest.fn(),
    };
    hasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    useCase = new AuthenticateUserUseCase(usersRepository, hasher);
  });

  it('deve autenticar com sucesso', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({ email: email.value, password: password.value });
    expect(result.user).toBe(user);
    expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(hasher.compare).toHaveBeenCalledWith(password.value, user.password.value);
  });

  it('deve falhar se usuário não existir', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({ email: email.value, password: password.value })
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('deve falhar se senha estiver errada', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(false);
    await expect(
      useCase.execute({ email: email.value, password: password.value })
    ).rejects.toThrow(InvalidCredentialsError);
  });
}); 