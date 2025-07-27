import { Injectable, Inject } from '@nestjs/common';
import { MatchesRepository } from '@betola/core';

export interface GetUpcomingMatchesRequest {
  limit?: number;
  status?: string;
  matchId?: string;
}

@Injectable()
export class GetUpcomingMatchesUseCase {
  constructor(
    @Inject('MatchesRepository')
    private readonly matchesRepository: MatchesRepository,
    @Inject('PrismaService')
    private readonly prisma: any
  ) {}

  async execute(request: GetUpcomingMatchesRequest): Promise<{ value: any[] }> {
    if (request.matchId) {
      const match = await this.prisma.match.findUnique({
        where: { id: request.matchId },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });
      
      return {
        value: match ? [this.formatMatch(match)] : []
      };
    }
    
    const matches = await this.prisma.match.findMany({
      where: {
        status: request.status || 'SCHEDULED',
        kickoffTime: {
          gte: new Date()
        }
      },
      include: {
        homeTeam: true,
        awayTeam: true
      },
      orderBy: { kickoffTime: 'asc' },
      take: request.limit || 20
    });
    
    return {
      value: matches.map(match => this.formatMatch(match))
    };
  }
  
  private formatMatch(match: any) {
    return {
      id: match.id,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName,
        logoUrl: match.homeTeam.logoUrl
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName,
        logoUrl: match.awayTeam.logoUrl
      },
      kickoffTime: match.kickoffTime.toISOString(),
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      round: match.round,
      season: match.season
    };
  }
}