import { PrismaClient } from '@prisma/client';
import { LeagueInvitesRepository, LeagueInvite, LeagueId, UserId, DateTime, UserDetails } from '@betola/core';
import { InviteStatus } from '@betola/core/modules/leagues/domain/entities/league-invite';

export class PrismaLeagueInvitesRepository implements LeagueInvitesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(invite: LeagueInvite): Promise<void> {
    const data = {
      id: invite.id.value,
      leagueId: invite.leagueId.value,
      invitedById: invite.invitedById.value,
      invitedUserId: invite.invitedUserId?.value,
      invitedEmail: invite.invitedEmail,
      status: invite.status,
      expiresAt: invite.expiresAt.value,
      respondedAt: invite.respondedAt?.value,
    };

    await this.prisma.leagueInvite.upsert({
      where: { id: invite.id.value },
      create: data,
      update: data
    });
  }

  async findById(id: string): Promise<LeagueInvite | null> {
    const invite = await this.prisma.leagueInvite.findUnique({
      where: { id }
    });

    if (!invite) {
      return null;
    }

    return this.toDomainEntity(invite);
  }

  async findPendingByLeagueAndUser(leagueId: LeagueId, userId: UserId): Promise<LeagueInvite | null> {
    const invite = await this.prisma.leagueInvite.findFirst({
      where: {
        leagueId: leagueId.value,
        invitedUserId: userId.value,
        status: InviteStatus.PENDING,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!invite) {
      return null;
    }

    return this.toDomainEntity(invite);
  }

  async findPendingByLeagueAndEmail(leagueId: LeagueId, email: string): Promise<LeagueInvite | null> {
    const invite = await this.prisma.leagueInvite.findFirst({
      where: {
        leagueId: leagueId.value,
        invitedEmail: email,
        status: InviteStatus.PENDING,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!invite) {
      return null;
    }

    return this.toDomainEntity(invite);
  }

  async findPendingInvite(leagueId: string, userId: string): Promise<LeagueInvite | null> {
    const invite = await this.prisma.leagueInvite.findFirst({
      where: {
        leagueId,
        invitedUserId: userId,
        status: InviteStatus.PENDING,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!invite) {
      return null;
    }

    return this.toDomainEntity(invite);
  }

  async findByUserId(userId: UserId): Promise<LeagueInvite[]> {
    const invites = await this.prisma.leagueInvite.findMany({
      where: {
        invitedUserId: userId.value
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return invites.map(invite => this.toDomainEntity(invite));
  }

  async findByEmail(email: string): Promise<LeagueInvite[]> {
    const invites = await this.prisma.leagueInvite.findMany({
      where: {
        invitedEmail: email
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return invites.map(invite => this.toDomainEntity(invite));
  }

  async findByLeagueId(leagueId: LeagueId): Promise<LeagueInvite[]> {
    const invites = await this.prisma.leagueInvite.findMany({
      where: {
        leagueId: leagueId.value
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return invites.map(invite => this.toDomainEntity(invite));
  }

  async getUserDetails(userId: UserId): Promise<UserDetails | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId.value },
      include: {
        profile: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.profile?.displayName,
      avatarUrl: user.profile?.avatarUrl
    };
  }

  async update(invite: LeagueInvite): Promise<void> {
    await this.save(invite);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.leagueInvite.delete({
      where: { id }
    });
  }

  private toDomainEntity(data: any): LeagueInvite {
    return new LeagueInvite({
      id: { value: data.id } as any,
      leagueId: LeagueId.fromString(data.leagueId),
      invitedById: UserId.fromString(data.invitedById),
      invitedUserId: data.invitedUserId ? UserId.fromString(data.invitedUserId) : undefined,
      invitedEmail: data.invitedEmail,
      status: data.status as InviteStatus,
      expiresAt: DateTime.fromDate(data.expiresAt),
      respondedAt: data.respondedAt ? DateTime.fromDate(data.respondedAt) : undefined,
      createdAt: DateTime.fromDate(data.createdAt),
      updatedAt: DateTime.fromDate(data.updatedAt)
    });
  }
}