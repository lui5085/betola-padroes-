// packages/core/src/auth/use-cases/register-user-use-case.ts
import { Email } from '../../../shared/types/email';
import { PlainPassword } from '../../../shared/plain-password';
import { HashedPassword } from '../../../shared/types/hashed-password';
import { Username } from '../../../shared/types/username';
import { UserId } from '../../../shared/types/user-id';
import { User } from '../entities/user';
import { Profile } from '../entities/profile';
import { IUsersRepository } from '../repositories/users-repository';
import { IProfilesRepository } from '../repositories/profiles-repository';
import { IHasher } from '../services/hasher';
import { EmailAlreadyExistsError } from './errors/email-already-exists-error';
import { UsernameAlreadyExistsError } from './errors/username-already-exists-error';
import { Result } from '../../shared/application/result';

interface RegisterUserUseCaseRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterUserUseCaseResponse {
  user: User;
  profile: Profile;
}

export class RegisterUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private profilesRepository: IProfilesRepository,
    private hasher: IHasher,
  ) {}

  async execute({
    email,
    password,
    username,
    firstName,
    lastName,
  }: RegisterUserUseCaseRequest): Promise<Result<RegisterUserUseCaseResponse>> {
    try {
      // Validações de entrada
      const emailVO = new Email(email);
      const plainPasswordVO = new PlainPassword(password);
      const usernameVO = new Username(username);

      // Verifica se email já existe
      const emailAlreadyExists = await this.usersRepository.findByEmail(emailVO);
      if (emailAlreadyExists) {
        return Result.failure('Email already registered');
      }

      // Verifica se username já existe
      const usernameAlreadyExists = await this.usersRepository.findByUsername(usernameVO);
      if (usernameAlreadyExists) {
        return Result.failure('Username already taken');
      }

      // Hash da senha
      const hashedPasswordStr = await this.hasher.hash(plainPasswordVO.value);
      const hashedPasswordVO = new HashedPassword(hashedPasswordStr);

      // Cria usuário
      const user = new User({
        email: emailVO,
        username: usernameVO,
        passwordHash: hashedPasswordVO,
      });

      // Cria profile
      const profile = new Profile({
        userId: user.id,
        displayName: `${firstName || ''} ${lastName || ''}`.trim() || username,
        avatarUrl: null,
        bio: null,
        favoriteTeam: null,
      });

      // Salva em transação
      await this.usersRepository.createWithProfile(user, profile);

      return Result.success({ user, profile });
    } catch (error) {
      if (error instanceof Error) {
        return Result.failure(error.message);
      }
      return Result.failure('An unexpected error occurred during registration');
    }
  }
}
