import { IUsersRepository, User } from '@betola/core';
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { UserId } from '@betola/core/shared/types/user-id';
import { Email } from '@betola/core/shared/types/email';
import { Password } from '@betola/core/shared/types/password';
import { Token } from '@betola/core/shared/types/token';
import { Timestamp } from '@betola/core/shared/types/timestamp';

export class PrismaUsersRepository implements IUsersRepository {
  async create(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id.value,
        email: user.email.value,
        password: user.password.value,
        createdAt: user.createdAt.value,
        updatedAt: user.updatedAt.value,
        passwordResetToken: user.passwordResetToken?.value ?? null,
        passwordResetExpires: user.passwordResetExpires?.value ?? null,
      },
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email: email.value,
      },
    });

    if (!user) {
      return null;
    }

    return new User(
      {
        email: new Email(user.email),
        password: new Password(user.password),
        passwordResetToken: user.passwordResetToken ? new Token(user.passwordResetToken) : null,
        passwordResetExpires: user.passwordResetExpires ? new Timestamp(user.passwordResetExpires) : null,
      },
      new UserId(user.id),
      new Timestamp(user.createdAt),
      new Timestamp(user.updatedAt),
    );
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: id.value,
      },
    });

    if (!user) {
      return null;
    }

    return new User(
      {
        email: new Email(user.email),
        password: new Password(user.password),
        passwordResetToken: user.passwordResetToken ? new Token(user.passwordResetToken) : null,
        passwordResetExpires: user.passwordResetExpires ? new Timestamp(user.passwordResetExpires) : null,
      },
      new UserId(user.id),
      new Timestamp(user.createdAt),
      new Timestamp(user.updatedAt),
    );
  }

  async save(user: User): Promise<void> {
    await prisma.user.update({
      where: {
        id: user.id.value,
      },
      data: {
        email: user.email.value,
        password: user.password.value,
        passwordResetToken: user.passwordResetToken?.value ?? null,
        passwordResetExpires: user.passwordResetExpires?.value ?? null,
        updatedAt: new Date(),
      },
    });
  }

  async findByPasswordResetToken(token: Token): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token.value,
      },
    });

    if (!user) {
      return null;
    }

    return new User(
      {
        email: new Email(user.email),
        password: new Password(user.password),
        passwordResetToken: user.passwordResetToken ? new Token(user.passwordResetToken) : null,
        passwordResetExpires: user.passwordResetExpires ? new Timestamp(user.passwordResetExpires) : null,
      },
      new UserId(user.id),
      new Timestamp(user.createdAt),
      new Timestamp(user.updatedAt),
    );
  }
} 