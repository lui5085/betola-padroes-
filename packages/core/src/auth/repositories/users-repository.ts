import { UserId } from '../../../shared/types/user-id';
import { Email } from '../../../shared/types/email';
import { Username } from '../../../shared/types/username';
import { Token } from '../../../shared/types/token';
import { User } from '../entities/user';

export interface IUsersRepository {
  create(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  findByPasswordResetToken(token: Token): Promise<User | null>;
  save(user: User): Promise<void>;
  createWithProfile(user: User, profile: any): Promise<void>;
}