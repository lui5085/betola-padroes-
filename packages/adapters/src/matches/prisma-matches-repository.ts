import { PrismaClient } from '@prisma/client';
import { MatchesRepository } from '@betola/core/modules/matches/domain/repositories/matches-repository';
import { Match } from '@betola/core/modules/matches/domain/entities/match';
import { MatchId } from '@betola/core/modules/matches/domain/value-objects/match-id';
import { TeamId } from '@betola/core/modules/matches/domain/value-objects/team-id';
import { DateTime } from '@betola/core/shared/domain/value-objects/date-time';
import { MatchStatus, MatchStatusVO } from '@betola/core/modules/matches/domain/value-objects/match-status';

export class PrismaMatchesRepository implements MatchesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(match: Match): Promise<void> {
    const data = {
      id: match.id.value,
      externalId: match.externalId,
      homeTeamId: match.homeTeamId.value,
      awayTeamId: match.awayTeamId.value,
      kickoffTime: match.kickoffTime.value,
      status: match.status.value,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      round: match.round,
      season: match.season,
      createdAt: match.createdAt?.value,
      updatedAt: match.updatedAt?.value
    };

    await this.prisma.match.upsert({
      where: { id: match.id.value },
      create: data,
      update: {
        ...data,
        createdAt: undefined // Don't update createdAt
      }
    });
  }

  async findById(id: MatchId): Promise<Match | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: id.value }
    });

    return match ? this.toDomain(match) : null;
  }

  async findByExternalId(externalId: string): Promise<Match | null> {
    const match = await this.prisma.match.findFirst({
      where: { externalId }
    });

    return match ? this.toDomain(match) : null;
  }

  async findAvailableForBetting(): Promise<Match[]> {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const matches = await this.prisma.match.findMany({
      where: {
        status: 'SCHEDULED',
        kickoffTime: {
          gte: fiveMinutesFromNow
        }
      },
      orderBy: {
        kickoffTime: 'asc'
      }
    });

    return matches.map(match => this.toDomain(match));
  }

  async findFinishedWithPendingBets(): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        status: 'FINISHED',
        betSelections: {
          some: {
            bet: {
              status: 'PENDING'
            }
          }
        }
      }
    });

    return matches.map(match => this.toDomain(match));
  }

  async findSettlementPending(): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        status: 'FINISHED',
        betSelections: {
          some: {
            bet: {
              status: 'PENDING'
            }
          }
        }
      }
    });

    return matches.map(match => this.toDomain(match));
  }

  async findUpcoming(limit?: number): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        status: 'SCHEDULED',
        kickoffTime: {
          gte: new Date()
        }
      },
      orderBy: { kickoffTime: 'asc' },
      take: limit || 20
    });

    return matches.map(match => this.toDomain(match));
  }

  async findByFilters(filters: any): Promise<Match[]> {
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.upcoming) {
      where.kickoffTime = { gte: new Date() };
    }
    
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.kickoffTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const matches = await this.prisma.match.findMany({
      where,
      orderBy: { kickoffTime: 'asc' }
    });

    return matches.map(match => this.toDomain(match));
  }

  async update(match: Match): Promise<void> {
    await this.prisma.match.update({
      where: { id: match.id.value },
      data: {
        status: match.status.value,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        updatedAt: match.updatedAt?.value
      }
    });
  }

  async upsert(match: Match): Promise<void> {
    const data = {
      id: match.id.value,
      externalId: match.externalId,
      homeTeamId: match.homeTeamId.value,
      awayTeamId: match.awayTeamId.value,
      kickoffTime: match.kickoffTime.value,
      status: match.status.value,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      round: match.round,
      season: match.season,
      createdAt: match.createdAt?.value,
      updatedAt: match.updatedAt?.value
    };

    await this.prisma.match.upsert({
      where: { id: match.id.value },
      create: data,
      update: {
        ...data,
        createdAt: undefined // Don't update createdAt
      }
    });
  }

  async findByStatus(status: MatchStatus): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: { status: status }
    });

    return matches.map(match => this.toDomain(match));
  }

  async delete(id: MatchId): Promise<void> {
    await this.prisma.match.delete({
      where: { id: id.value }
    });
  }

  private toDomain(data: any): Match {
    return new Match({
      id: new MatchId(data.id),
      externalId: data.externalId,
      homeTeamId: new TeamId(data.homeTeamId),
      awayTeamId: new TeamId(data.awayTeamId),
      kickoffTime: new DateTime(data.kickoffTime),
      status: new MatchStatusVO(data.status as MatchStatus),
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      round: data.round,
      season: data.season,
      createdAt: data.createdAt ? new DateTime(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new DateTime(data.updatedAt) : undefined
    });
  }
}