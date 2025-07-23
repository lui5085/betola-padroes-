import { User } from '../entities/user';
import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';
import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';

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
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    const emailVO = new Email(email);
    const passwordVO = new Password(password);
    const user = await this.usersRepository.findByEmail(emailVO);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // O Password VO armazena o hash, então precisamos comparar o valor puro
    const doesPasswordMatch = await this.hasher.compare(password, user.password.value);

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    return {
      user,
    };
  }
} 