import { PrismaClient } from '@prisma/client';
import { IUsersRepository } from '@betola/core/auth/repositories/users-repository';
import { User } from '@betola/core/auth/entities/user';
import { Profile } from '@betola/core/auth/entities/profile';
import { UserId } from '@betola/core/shared/types/user-id';
import { Email } from '@betola/core/shared/types/email';
import { Username } from '@betola/core/shared/types/username';
import { Token } from '@betola/core/shared/types/token';
import { HashedPassword } from '@betola/core/shared/types/hashed-password';
import { Timestamp } from '@betola/core/shared/types/timestamp';

export class PrismaUsersRepository implements IUsersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id.value,
        email: user.email.value,
        username: user.username.value,
        passwordHash: user.passwordHash.value,
        passwordResetToken: user.passwordResetToken?.value,
        passwordResetExpires: user.passwordResetExpires?.value,
        createdAt: user.createdAt.value,
        updatedAt: user.updatedAt.value,
      },
    });
  }

  async createWithProfile(user: User, profile: Profile): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Cria o usuário
      await tx.user.create({
        data: {
          id: user.id.value,
          email: user.email.value,
          username: user.username.value,
          passwordHash: user.passwordHash.value,
            passwordResetToken: user.passwordResetToken?.value,
          passwordResetExpires: user.passwordResetExpires?.value,
          createdAt: user.createdAt.value,
          updatedAt: user.updatedAt.value,
        },
      });

      // Cria o profile
      await tx.profile.create({
        data: {
          id: profile.id.value,
          userId: profile.userId.value,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          favoriteTeam: profile.favoriteTeam,
          createdAt: profile.createdAt.value,
          updatedAt: profile.updatedAt.value,
        },
      });

      // Cria a wallet com saldo inicial
      await tx.wallet.create({
        data: {
          userId: user.id.value,
          balance: 1000, // Betoletas iniciais
        },
      });
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findByUsername(username: Username): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.value },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.value },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async findByPasswordResetToken(token: Token): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token.value },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.value },
      data: {
        email: user.email.value,
        username: user.username.value,
        passwordHash: user.passwordHash.value,
        passwordResetToken: user.passwordResetToken?.value,
        passwordResetExpires: user.passwordResetExpires?.value,
        updatedAt: user.updatedAt.value,
        // Campos adicionais para rate limiting (adicionar ao schema)
        // loginAttempts: user.loginAttempts,
        // lastLoginAttempt: user.lastLoginAttempt?.value,
        // lockedUntil: user.lockedUntil?.value,
      },
    });
  }

  private toDomain(user: any): User {
    return new User(
      {
        email: new Email(user.email),
        username: new Username(user.username),
        passwordHash: new HashedPassword(user.passwordHash),
        passwordResetToken: user.passwordResetToken ? new Token(user.passwordResetToken) : null,
        passwordResetExpires: user.passwordResetExpires ? new Timestamp(user.passwordResetExpires) : null,
        // loginAttempts: user.loginAttempts || 0,
        // lastLoginAttempt: user.lastLoginAttempt ? new Timestamp(user.lastLoginAttempt) : null,
        // lockedUntil: user.lockedUntil ? new Timestamp(user.lockedUntil) : null,
      },
      new UserId(user.id),
      new Timestamp(user.createdAt),
      new Timestamp(user.updatedAt),
    );
  }
}