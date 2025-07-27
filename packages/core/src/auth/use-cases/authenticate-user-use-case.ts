import { User } from '../entities/user';
import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { Email } from '../../../shared/types/email';
import { PlainPassword } from '../../../shared/plain-password';
import { Result } from '../../shared/application/result';

interface AuthenticateUserUseCaseRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserUseCaseResponse {
  user: User;
}

export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private hasher: IHasher,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<Result<AuthenticateUserUseCaseResponse>> {
    try {
      const emailVO = new Email(email);
      const plainPasswordVO = new PlainPassword(password);
      
      const user = await this.usersRepository.findByEmail(emailVO);

      if (!user) {
        return Result.failure('Invalid credentials');
      }

      // Verifica se a conta está bloqueada
      if (user.isLocked()) {
        return Result.failure('Account is locked due to too many failed login attempts. Please try again later.');
      }

      // Compara a senha
      const doesPasswordMatch = await this.hasher.compare(
        plainPasswordVO.value, 
        user.passwordHash.value
      );

      if (!doesPasswordMatch) {
        // Incrementa tentativas de login falhadas
        user.incrementLoginAttempts();
        await this.usersRepository.save(user);
        
        if (user.isLocked()) {
          return Result.failure('Account has been locked due to too many failed login attempts.');
        }
        
        return Result.failure(`Invalid credentials. ${5 - user.loginAttempts} attempts remaining.`);
      }


      // Reset tentativas de login em caso de sucesso
      user.resetLoginAttempts();
      await this.usersRepository.save(user);

      return Result.success({ user });
    } catch (error) {
      if (error instanceof Error) {
        return Result.failure(error.message);
      }
      return Result.failure('An unexpected error occurred');
    }
  }
}