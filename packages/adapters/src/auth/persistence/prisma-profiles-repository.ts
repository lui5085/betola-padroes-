import { IProfilesRepository, Profile } from '@betola/core';
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { UserId } from '@betola/core/shared/types/user-id';
import { Timestamp } from '@betola/core/shared/types/timestamp';

export class PrismaProfilesRepository implements IProfilesRepository {
  async create(profile: Profile): Promise<void> {
    await prisma.profile.create({
      data: {
        id: profile.id.value,
        userId: profile.userId.value,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        createdAt: profile.createdAt.value,
        updatedAt: profile.updatedAt.value,
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
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
      },
      new UserId(profile.id),
      new Timestamp(profile.createdAt),
      new Timestamp(profile.updatedAt),
    );
  }

  async findByDisplayName(displayName: string): Promise<Profile | null> {
    const profile = await prisma.profile.findFirst({
      where: {
        displayName: displayName,
      },
    });

    if (!profile) {
      return null;
    }

    return new Profile(
      {
        userId: new UserId(profile.userId),
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
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
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        updatedAt: new Date(),
      },
    });
  }
} 