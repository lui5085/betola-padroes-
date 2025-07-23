import { IProfilesRepository, Profile } from '@betola/core';
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { UserId } from '@betola/core/shared/types/user-id';
import { Username } from '@betola/core/shared/types/username';
import { Timestamp } from '@betola/core/shared/types/timestamp';

export class PrismaProfilesRepository implements IProfilesRepository {
  async create(profile: Profile): Promise<void> {
    await prisma.profile.create({
      data: {
        id: profile.id.value,
        username: profile.username.value,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt.value,
        updatedAt: profile.updatedAt.value,
        userId: profile.userId.value,
      },
    });
  }

  async findByUserId(userId: UserId): Promise<Profile | null> {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: userId.value,
      },
    });

    if (!profile) {
      return null;
    }

    return new Profile(
      {
        userId: new UserId(profile.userId),
        username: new Username(profile.username),
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      },
      new UserId(profile.id),
      new Timestamp(profile.createdAt),
      new Timestamp(profile.updatedAt),
    );
  }

  async findByUsername(username: Username): Promise<Profile | null> {
    const profile = await prisma.profile.findUnique({
      where: {
        username: username.value,
      },
    });

    if (!profile) {
      return null;
    }

    return new Profile(
      {
        userId: new UserId(profile.userId),
        username: new Username(profile.username),
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      },
      new UserId(profile.id),
      new Timestamp(profile.createdAt),
      new Timestamp(profile.updatedAt),
    );
  }

  async save(profile: Profile): Promise<void> {
    await prisma.profile.update({
      where: {
        id: profile.id.value,
      },
      data: {
        username: profile.username.value,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        updatedAt: new Date(),
      },
    });
  }
} 