import { PrismaClient } from '@prisma/client';
import { LeaguesRepository, League, LeagueId, LeagueMember, UserId, LeagueCode, MemberRoleVO, MemberRole, DateTime, LeagueMemberDetails, LeagueFilters } from '@betola/core';

export class PrismaLeaguesRepository implements LeaguesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(league: League): Promise<void> {
    const data = {
      id: league.id.value,
      name: league.name,
      code: league.code.value,
      description: league.description,
      imageUrl: league.imageUrl,
      ownerId: league.ownerId.value,
      maxMembers: league.maxMembers,
      isPrivate: league.isPrivate,
      settings: JSON.stringify(league.settings)
    };

    await this.prisma.league.upsert({
      where: { id: league.id.value },
      create: data,
      update: data
    });

    // Save members
    const members = league.getMembers();
    for (const member of members) {
      await this.prisma.leagueMember.upsert({
        where: {
          leagueId_userId: {
            leagueId: league.id.value,
            userId: member.userId.value
          }
        },
        create: {
          leagueId: league.id.value,
          userId: member.userId.value,
          role: member.role.value,
          totalPoints: member.totalPoints,
          wonBets: member.wonBets,
          lostBets: member.lostBets,
          joinedAt: member.joinedAt.value
        },
        update: {
          role: member.role.value,
          totalPoints: member.totalPoints,
          wonBets: member.wonBets,
          lostBets: member.lostBets
        }
      });
    }
  }

  async findById(id: LeagueId): Promise<League | null> {
    const result = await this.prisma.league.findUnique({
      where: { id: id.value },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    if (!result) return null;

    return this.toDomainEntity(result);
  }

  async findByCode(code: LeagueCode): Promise<League | null> {
    const result = await this.prisma.league.findUnique({
      where: { code: code.value },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    if (!result) return null;

    return this.toDomainEntity(result);
  }

  async findByUserId(userId: UserId): Promise<League[]> {
    const results = await this.prisma.league.findMany({
      where: {
        members: {
          some: {
            userId: userId.value
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    return results.map(result => this.toDomainEntity(result));
  }

  async findByFilters(filters: LeagueFilters): Promise<League[]> {
    const results = await this.prisma.league.findMany({
      where: {
        isPrivate: filters.isPrivate,
        ownerId: filters.ownerId?.value,
        OR: filters.search ? [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ] : undefined
      },
      include: {
        members: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return results.map(result => this.toDomainEntity(result));
  }

  async update(league: League): Promise<void> {
    await this.save(league);
  }

  async findMembersWithUserDetails(leagueId: LeagueId): Promise<LeagueMemberDetails[]> {
    const members = await this.prisma.leagueMember.findMany({
      where: { leagueId: leagueId.value },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        totalPoints: 'desc'
      }
    });

    return members.map((member, index) => ({
      id: member.id,
      userId: member.userId,
      username: member.user.username,
      displayName: member.user.profile?.displayName,
      avatarUrl: member.user.profile?.avatarUrl,
      role: member.role,
      totalPoints: member.totalPoints,
      wonBets: member.wonBets,
      lostBets: member.lostBets,
      position: index + 1,
      joinedAt: member.joinedAt
    }));
  }

  async findUserByUsername(username: string): Promise<{ id: string; username: string; email: string; displayName?: string; avatarUrl?: string; } | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
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

  async delete(id: LeagueId): Promise<void> {
    await this.prisma.league.delete({
      where: { id: id.value }
    });
  }

  private toDomainEntity(data: any): League {
    // Create members array
    const members: LeagueMember[] = data.members.map((membership: any) => {
      return new LeagueMember({
        id: LeagueMember.generateId(),
        leagueId: LeagueId.fromString(data.id),
        userId: UserId.fromString(membership.userId),
        role: new MemberRoleVO(
          membership.userId === data.ownerId ? MemberRole.OWNER :
          membership.role === 'ADMIN' ? MemberRole.ADMIN : MemberRole.MEMBER
        ),
        totalPoints: membership.totalPoints || 0,
        wonBets: membership.wonBets || 0,
        lostBets: membership.lostBets || 0,
        joinedAt: DateTime.fromDate(membership.joinedAt),
        createdAt: DateTime.fromDate(membership.createdAt),
        updatedAt: DateTime.fromDate(membership.updatedAt)
      });
    });

    return new League({
      id: LeagueId.fromString(data.id),
      name: data.name,
      code: LeagueCode.fromString(data.code),
      description: data.description,
      imageUrl: data.imageUrl,
      ownerId: UserId.fromString(data.ownerId),
      maxMembers: data.maxMembers,
      isPrivate: data.isPrivate,
      settings: data.settings || {},
      members,
      createdAt: DateTime.fromDate(data.createdAt),
      updatedAt: DateTime.fromDate(data.updatedAt)
    });
  }
}