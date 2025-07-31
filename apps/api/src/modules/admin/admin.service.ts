import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotificationsHelper } from '../notifications/notifications.helper';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsHelper: NotificationsHelper,
  ) {}

  async getPendingBets(options: { page: number; limit: number }) {
    const skip = (options.page - 1) * options.limit;
    
    const [bets, total] = await Promise.all([
      this.prisma.bet.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: { id: true, username: true, email: true }
          },
          selections: {
            include: {
              match: {
                select: { 
                  id: true, 
                  homeTeam: true, 
                  awayTeam: true, 
                  createdAt: true,
                  status: true,
                  homeScore: true,
                  awayScore: true
                }
              },
              market: {
                select: { id: true, type: true, name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: options.limit,
      }),
      this.prisma.bet.count({
        where: { status: 'PENDING' }
      })
    ]);

    return {
      bets,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit),
      }
    };
  }

  async getBetDetails(betId: string) {
    return this.prisma.bet.findUnique({
      where: { id: betId },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        selections: {
          include: {
            match: true,
            market: true
          }
        }
      }
    });
  }

  async settleBetManually(data: {
    betId: string;
    status: 'WON' | 'LOST';
    adminId: string;
    reason?: string;
  }) {
    const bet = await this.prisma.bet.findUnique({
      where: { id: data.betId },
      include: { user: true }
    });

    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.status !== 'PENDING') {
      throw new Error('Bet is already settled');
    }

    // Calcular payout se a aposta foi ganha
    const payout = data.status === 'WON' ? bet.potentialReturn : 0;

    // Atualizar a aposta
    const updatedBet = await this.prisma.bet.update({
      where: { id: data.betId },
      data: {
        status: data.status,
        settledAt: new Date(),
      }
    });

    // Se ganhou, adicionar fundos à carteira
    if (data.status === 'WON' && payout > 0) {
      await this.prisma.wallet.update({
        where: { userId: bet.userId },
        data: {
          balance: { increment: payout }
        }
      });
    }

    // Criar notificação
    await this.notificationsHelper.notifyBetSettled({
      userId: bet.userId,
      betId: data.betId,
      status: data.status,
      amount: bet.amount,
      payout: data.status === 'WON' ? payout : undefined,
    });

    return {
      success: true,
      bet: updatedBet,
      payout: data.status === 'WON' ? payout : 0,
    };
  }

  async settleMultipleBets(data: {
    betIds: string[];
    status: 'WON' | 'LOST';
    adminId: string;
    reason?: string;
  }) {
    const results = [];
    
    for (const betId of data.betIds) {
      try {
        const result = await this.settleBetManually({
          betId,
          status: data.status,
          adminId: data.adminId,
          reason: data.reason,
        });
        results.push({ betId, success: true, result });
      } catch (error) {
        results.push({ betId, success: false, error: error.message });
      }
    }

    return {
      results,
      summary: {
        total: data.betIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      }
    };
  }

  async getMatches(options: {
    status?: string;
    page: number;
    limit: number;
  }) {
    const skip = (options.page - 1) * options.limit;
    const where = options.status ? { status: options.status } : {};
    
    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        include: {
          _count: {
            select: { 
              markets: true,
              betSelections: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: options.limit,
      }),
      this.prisma.match.count({ where })
    ]);

    return {
      matches,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit),
      }
    };
  }

  async updateMatchResult(data: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    status: string;
    adminId: string;
  }) {
    const match = await this.prisma.match.update({
      where: { id: data.matchId },
      data: {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        status: data.status,
        updatedAt: new Date(),
      }
    });

    return { success: true, match };
  }

  async getAdminStats() {
    const [
      totalBets,
      pendingBets,
      totalUsers,
      totalMatches,
      totalLeagues
    ] = await Promise.all([
      this.prisma.bet.count(),
      this.prisma.bet.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count(),
      this.prisma.match.count(),
      this.prisma.league.count(),
    ]);

    return {
      bets: {
        total: totalBets,
        pending: pendingBets,
        settled: totalBets - pendingBets,
      },
      users: { total: totalUsers },
      matches: { total: totalMatches },
      leagues: { total: totalLeagues },
    };
  }
}