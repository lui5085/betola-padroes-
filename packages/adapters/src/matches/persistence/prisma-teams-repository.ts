import { PrismaClient } from '@prisma/client';
import { TeamsRepository } from '@betola/core/modules/matches/domain/repositories/teams-repository';
import { Team } from '@betola/core/modules/matches/domain/entities/team';
import { TeamId } from '@betola/core/modules/matches/domain/value-objects/team-id';
import { DateTime } from '@betola/core/shared/domain/value-objects/date-time';

export class PrismaTeamsRepository implements TeamsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(team: Team): Promise<void> {
    const data = {
      id: team.id.value,
      externalId: team.externalId,
      name: team.name,
      shortName: team.shortName,
      logoUrl: team.logoUrl,
      createdAt: team.createdAt?.value,
      updatedAt: team.updatedAt?.value
    };

    await this.prisma.team.upsert({
      where: { id: team.id.value },
      create: data,
      update: {
        ...data,
        createdAt: undefined // Don't update createdAt
      }
    });
  }

  async findById(id: TeamId): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: id.value }
    });

    return team ? this.toDomain(team) : null;
  }

  async findByExternalId(externalId: string): Promise<Team | null> {
    const team = await this.prisma.team.findFirst({
      where: { externalId }
    });

    return team ? this.toDomain(team) : null;
  }

  async findByName(name: string): Promise<Team | null> {
    const team = await this.prisma.team.findFirst({
      where: { name }
    });

    return team ? this.toDomain(team) : null;
  }

  async findAll(): Promise<Team[]> {
    const teams = await this.prisma.team.findMany();
    return teams.map(team => this.toDomain(team));
  }

  async delete(id: TeamId): Promise<void> {
    await this.prisma.team.delete({
      where: { id: id.value }
    });
  }

  private toDomain(data: any): Team {
    return new Team({
      id: new TeamId(data.id),
      externalId: data.externalId,
      name: data.name,
      shortName: data.shortName,
      logoUrl: data.logoUrl,
      createdAt: data.createdAt ? new DateTime(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new DateTime(data.updatedAt) : undefined
    });
  }
}