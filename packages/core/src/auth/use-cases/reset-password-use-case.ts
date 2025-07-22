import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { InvalidResetTokenError } from './errors/invalid-reset-token-error';
import { Token } from '../../../shared/types/token';
import { Timestamp } from '../../../shared/types/timestamp';
import { Password } from '../../../shared/types/password';

interface ResetPasswordUseCaseRequest {
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private hasher: IHasher,
  ) {}

  async execute({
    token,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<void> {
    const tokenVO = new Token(token);
    const user = await this.usersRepository.findByPasswordResetToken(tokenVO);

    if (!user || !user.passwordResetExpires) {
      throw new InvalidResetTokenError();
    }

    const now = new Timestamp(new Date());
    if (now.value.getTime() > user.passwordResetExpires.value.getTime()) {
      throw new InvalidResetTokenError();
    }

    const hashedPassword = await this.hasher.hash(newPassword);
    user.password = new Password(hashedPassword);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await this.usersRepository.save(user);
  }
} 