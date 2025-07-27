import { IUsersRepository } from '../repositories/users-repository';
import { Token } from '../../../shared/types/token';
import { Timestamp } from '../../../shared/types/timestamp';
import { Result } from '../../shared/application/result';

interface VerifyEmailUseCaseRequest {
  token: string;
}

export class VerifyEmailUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute({ token }: VerifyEmailUseCaseRequest): Promise<Result<void>> {
    try {
      const tokenVO = new Token(token);
      const user = await this.usersRepository.findByPasswordResetToken(tokenVO);

      if (!user) {
        return Result.failure('Invalid or expired verification token');
      }

      // Verifica se o token não expirou
      if (user.passwordResetExpires) {
        const now = new Timestamp(new Date());
        if (now.value.getTime() > user.passwordResetExpires.value.getTime()) {
          return Result.failure('Verification token has expired');
        }
      }

      // Marca email como verificado
      user.emailVerified = true;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      user.updatedAt = new Timestamp(new Date());

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