import { ResetPasswordUseCase } from './reset-password-use-case';
import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { InvalidResetTokenError } from './errors/invalid-reset-token-error';
import { User } from '../entities/user';
import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';
import { HashedPassword } from '../../../shared/types/hashed-password';
import { Token } from '../../../shared/types/token';
import { Timestamp } from '../../../shared/types/timestamp';
import { Username } from '../../../shared/types/username';

const makeUsersRepository = (): jest.Mocked<IUsersRepository> => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  createWithProfile: jest.fn(),
  findByPasswordResetToken: jest.fn(),
  findById: jest.fn(),
});

const makeHasher = (): jest.Mocked<IHasher> => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

describe('ResetPasswordUseCase', () => {
  it('deve resetar a senha se token válido e não expirado', async () => {
    const usersRepository = makeUsersRepository();
    const hasher = makeHasher();
    const useCase = new ResetPasswordUseCase(usersRepository, hasher);
    const validToken = 'a'.repeat(64); // token válido
    const user = new User({
      email: new Email('test@example.com'),
      username: new Username('testuser'),
      passwordHash: new HashedPassword('$2b$10$hashedpassword'),
      passwordResetToken: new Token(validToken),
      passwordResetExpires: new Timestamp(new Date(Date.now() + 10000)),
    });
    usersRepository.findByPasswordResetToken.mockResolvedValue(user);
    hasher.hash.mockResolvedValue('NovaSenha@123');
    await useCase.execute({ token: validToken, newPassword: 'NovaSenha@123' });
    expect(usersRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      passwordHash: expect.any(HashedPassword),
      passwordResetToken: null,
      passwordResetExpires: null,
    }));
  });

  it('deve lançar InvalidResetTokenError se token inválido', async () => {
    const usersRepository = makeUsersRepository();
    const hasher = makeHasher();
    const useCase = new ResetPasswordUseCase(usersRepository, hasher);
    // token válido, mas não encontrado
    const validToken = 'b'.repeat(64);
    usersRepository.findByPasswordResetToken.mockResolvedValue(null);
    await expect(useCase.execute({ token: validToken, newPassword: 'NovaSenha@123' }))
      .rejects.toBeInstanceOf(InvalidResetTokenError);
  });

  it('deve lançar InvalidResetTokenError se token expirado', async () => {
    const usersRepository = makeUsersRepository();
    const hasher = makeHasher();
    const useCase = new ResetPasswordUseCase(usersRepository, hasher);
    const expiredToken = 'c'.repeat(64);
    const user = new User({
      email: new Email('test@example.com'),
      username: new Username('testuser'),
      passwordHash: new HashedPassword('$2b$10$hashedpassword'),
      passwordResetToken: new Token(expiredToken),
      passwordResetExpires: new Timestamp(new Date(Date.now() - 10000)),
    });
    usersRepository.findByPasswordResetToken.mockResolvedValue(user);
    await expect(useCase.execute({ token: expiredToken, newPassword: 'NovaSenha@123' }))
      .rejects.toBeInstanceOf(InvalidResetTokenError);
  });
}); 