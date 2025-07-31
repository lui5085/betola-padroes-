// packages/adapters/src/betting/persistence/prisma-bets-repository.ts

import { PrismaClient } from '@prisma/client';
import { 
  BetsRepository,
  Bet,
  BetId,
  UserId,
  BetStatus,
  BetFilters,
  PaginatedBets,
  BetAmount,
  BetStatusVO,
  DateTime,
  Odds,
  MarketTypeVO,
  MarketType,
  MatchId,
  BetSelection
} from '@betola/core';

export class PrismaBetsRepository implements BetsRepository {
  constructor(private prisma: PrismaClient) {}

  async save(bet: Bet): Promise<void> {
    // First, find the correct marketIds for each selection
    const selectionsWithMarketIds = await Promise.all(
      bet.selections.map(async selection => {
        const market = await this.prisma.market.findFirst({
          where: {
            matchId: selection.matchId.value,
            type: selection.marketType.value
          }
        });

        if (!market) {
          throw new Error(`Market not found for match ${selection.matchId.value} and type ${selection.marketType.value}`);
        }

        return {
          matchId: selection.matchId.value,
          marketId: market.id,
          marketType: selection.marketType.value,
          selection: selection.selection,
          optionName: selection.selection,
          odds: selection.odds.value
        };
      })
    );

    await this.prisma.bet.create({
      data: {
        id: bet.id.value,
        userId: bet.userId.value,
        totalOdds: bet.totalOdds.value,
        amount: bet.amount.value,
        potentialReturn: bet.potentialWin,
        status: bet.status.value as any,
        selections: {
          create: selectionsWithMarketIds
        }
      }
    });
  }

  async findById(id: BetId): Promise<Bet | null> {
    const bet = await this.prisma.bet.findUnique({
      where: { id: id.value },
      include: { 
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        }
      }
    });

    if (!bet) return null;

    return this.toDomain(bet);
  }

  async findByUserId(userId: UserId, filters?: BetFilters): Promise<PaginatedBets> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId: userId.value };
    if (filters?.status) {
      where.status = filters.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.bet.findMany({
        where,
        include: { 
          selections: {
            include: {
              match: {
                include: {
                  homeTeam: true,
                  awayTeam: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.bet.count({ where })
    ]);

    return {
      items: items.map(bet => this.toDomain(bet)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findPendingBets(): Promise<Bet[]> {
    const bets = await this.prisma.bet.findMany({
      where: { status: 'PENDING' },
      include: { 
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        }
      }
    });

    return bets.map(bet => this.toDomain(bet));
  }

  async findPendingBetsForMatches(matchIds: string[]): Promise<Bet[]> {
    const bets = await this.prisma.bet.findMany({
      where: { 
        status: 'PENDING',
        selections: {
          some: {
            matchId: { in: matchIds }
          }
        }
      },
      include: { 
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        }
      }
    });

    return bets.map(bet => this.toDomain(bet));
  }

  async findPendingByMatch(matchId: MatchId): Promise<Bet[]> {
    const bets = await this.prisma.bet.findMany({
      where: { 
        status: 'PENDING',
        selections: {
          some: {
            matchId: matchId.value
          }
        }
      },
      include: { 
        selections: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        }
      }
    });

    return bets.map(bet => this.toDomain(bet));
  }

  async findPendingByMatchId(matchId: string): Promise<Bet[]> {
    const bets = await this.prisma.bet.findMany({
      where: {
        status: 'PENDING',
        selections: { some: { matchId } },
      },
      include: { selections: true },
    });
    return bets.map(bet => this.toDomain(bet));
  }

  async update(bet: Bet): Promise<void> {
    await this.prisma.bet.update({
      where: { id: bet.id.value },
      data: {
        status: bet.status.value as any,
        settledAt: bet.settledAt?.value,
        updatedAt: bet.updatedAt?.value || new Date()
      }
    });
  }

  private toDomain(bet: any): Bet {
    const selections = bet.selections.map((s: any) => 
      new BetSelection({
        betId: new BetId(bet.id),
        matchId: new MatchId(s.matchId),
        marketType: new MarketTypeVO(s.marketType as MarketType),
        selection: s.selection,
        odds: new Odds(s.odds)
      })
    );

    return new Bet({
      id: new BetId(bet.id),
      userId: new UserId(bet.userId),
      selections,
      amount: new BetAmount(bet.amount),
      status: new BetStatusVO(bet.status as BetStatus),
      settledAt: bet.settledAt ? new DateTime(bet.settledAt) : undefined,
      createdAt: new DateTime(bet.createdAt),
      updatedAt: new DateTime(bet.updatedAt)
    });
  }
}