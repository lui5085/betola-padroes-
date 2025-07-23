import { Email } from '../../../shared/types/email';
import { Password } from '../../../shared/types/password';
import { Username } from '../../../shared/types/username';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { User } from '../entities/user';
import { IUsersRepository } from '../repositories/users-repository';
import { IHasher } from '../services/hasher';
import { EmailAlreadyExistsError } from './errors/email-already-exists-error';
import { IProfilesRepository } from '../repositories/profiles-repository';
import { Profile } from '../entities/profile';
import { UsernameAlreadyExistsError } from './errors/username-already-exists-error';

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
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const emailVO = new Email(email);
    const passwordVO = new Password(password);
    const usernameVO = new Username(username);

    const emailAlreadyExists = await this.usersRepository.findByEmail(emailVO);
    if (emailAlreadyExists) {
      throw new EmailAlreadyExistsError();
    }

    const usernameAlreadyExists = await this.profilesRepository.findByUsername(usernameVO);
    if (usernameAlreadyExists) {
      throw new UsernameAlreadyExistsError();
    }

    // Supondo que o hasher retorna string, mas o VO Password espera string "pura" (não hash),
    // então criamos o Password VO com o hash
    const hashedPassword = await this.hasher.hash(password);
    const hashedPasswordVO = new Password(hashedPassword);

    const user = new User({
      email: emailVO,
      password: hashedPasswordVO,
    });

    await this.usersRepository.create(user);

    const profile = new Profile({
      userId: user.id,
      username: usernameVO,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      avatarUrl: null,
    });

    await this.profilesRepository.create(profile);

    return {
      user,
      profile,
    };
  }
} 