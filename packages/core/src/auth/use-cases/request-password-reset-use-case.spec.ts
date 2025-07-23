import { RequestPasswordResetUseCase } from './request-password-reset-use-case';
import { IUsersRepository } from '../repositories/users-repository';
import { IEmailSender } from '../services/email-sender';
import { UserNotFoundError } from './errors/user-not-found-error';
import { User } from '../entities/user';
import { Email } from '../../../shared/types/email';
import { Token } from '../../../shared/types/token';
import { Timestamp } from '../../../shared/types/timestamp';
import { Password } from '../../../shared/types/password';

const makeUsersRepository = (): jest.Mocked<IUsersRepository> => ({
  findByEmail: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findByPasswordResetToken: jest.fn(),
  findById: jest.fn(),
});

const makeEmailSender = (): jest.Mocked<IEmailSender> => ({
  send: jest.fn(),
});

describe('RequestPasswordResetUseCase', () => {
  it('deve enviar email de reset se usuário existir', async () => {
    const usersRepository = makeUsersRepository();
    const emailSender = makeEmailSender();
    const useCase = new RequestPasswordResetUseCase(usersRepository, emailSender);
    const user = new User({
      email: new Email('test@example.com'),
      password: new Password('Senha@123'),
    });
    usersRepository.findByEmail.mockResolvedValue(user);
    await useCase.execute({ email: 'test@example.com' });
    expect(usersRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      email: expect.any(Email),
      passwordResetToken: expect.any(Token),
      passwordResetExpires: expect.any(Timestamp),
    }));
    expect(emailSender.send).toHaveBeenCalled();
  });

  it('deve lançar UserNotFoundError se usuário não existir', async () => {
    const usersRepository = makeUsersRepository();
    const emailSender = makeEmailSender();
    const useCase = new RequestPasswordResetUseCase(usersRepository, emailSender);
    usersRepository.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute({ email: 'naoexiste@example.com' }))
      .rejects.toBeInstanceOf(UserNotFoundError);
  });
}); 