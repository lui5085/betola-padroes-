import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { InvalidResetTokenError } from './errors/invalid-reset-token-error';
import { Token } from '../../../shared/types/token';
import { Timestamp } from '../../../shared/types/timestamp';
import { PlainPassword } from '../../../shared/plain-password';
import { HashedPassword } from '../../../shared/types/hashed-password';
import { Result } from '../../shared/application/result';

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
  }: ResetPasswordUseCaseRequest): Promise<Result<void>> {
    try {
      const tokenVO = new Token(token);
      const plainPasswordVO = new PlainPassword(newPassword);
      
      const user = await this.usersRepository.findByPasswordResetToken(tokenVO);

      if (!user || !user.passwordResetExpires) {
        return Result.failure('Invalid or expired reset token');
      }

      const now = new Timestamp(new Date());
      if (now.value.getTime() > user.passwordResetExpires.value.getTime()) {
        return Result.failure('Reset token has expired');
      }

      const hashedPassword = await this.hasher.hash(plainPasswordVO.value);
      const hashedPasswordVO = new HashedPassword(hashedPassword);
      
      user.updatePassword(hashedPasswordVO);
      await this.usersRepository.save(user);

      return Result.success(undefined);
    } catch (error) {
      if (error instanceof Error) {
        return Result.failure(error.message);
      }
      return Result.failure('An unexpected error occurred');
    }
  }
}