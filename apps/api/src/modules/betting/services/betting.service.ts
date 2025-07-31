import { Injectable, Logger, Inject } from '@nestjs/common';
import { BetsRepository } from '@betola/core/modules/betting/domain/repositories/bets-repository';
import { MarketsRepository } from '@betola/core/modules/betting/domain/repositories/markets-repository';
import { MatchesRepository } from '@betola/core/modules/matches/domain/repositories/matches-repository';
import { WalletsRepository } from '@betola/core/modules/wallet/domain/repositories/wallets-repository';
import { UserId } from '@betola/core/modules/auth/domain/value-objects/user-id';
import { MatchId } from '@betola/core/modules/matches/domain/value-objects/match-id';
import { MarketId } from '@betola/core/modules/betting/domain/value-objects/market-id';

@Injectable()
export class BettingService {
  private readonly logger = new Logger(BettingService.name);

  constructor(
    @Inject('BetsRepository') private readonly betsRepository: BetsRepository,
    @Inject('MarketsRepository') private readonly marketsRepository: MarketsRepository,
    @Inject('MatchesRepository') private readonly matchesRepository: MatchesRepository,
    @Inject('WalletsRepository') private readonly walletsRepository: WalletsRepository
  ) {}

  async validateBet(
    userId: string,
    selections: Array<{
      matchId: string;
      marketId: string;
      optionName: string;
      odds: number;
    }>,
    amount: number
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check wallet balance
    const wallet = await this.walletsRepository.findByUserId(new UserId(userId));
    if (!wallet || wallet.balance.value < amount) {
      errors.push('Insufficient balance');
      return { isValid: false, errors };
    }

    // Validate each selection
    for (const selection of selections) {
      // Check if match exists and is available for betting
      const match = await this.matchesRepository.findById(new MatchId(selection.matchId));
      if (!match) {
        errors.push(`Match ${selection.matchId} not found`);
        continue;
      }

      if (!match.isAvailableForBetting()) {
        errors.push(`Match ${selection.matchId} is not available for betting`);
        continue;
      }

      // Check if market exists and is active
      const market = await this.marketsRepository.findById(new MarketId(selection.marketId));
      if (!market) {
        errors.push(`Market ${selection.marketId} not found`);
        continue;
      }

      if (!market.isActive) {
        errors.push(`Market ${selection.marketId} is not active`);
        continue;
      }

      // Check if option exists
      const option = market.findOption(selection.optionName);
      if (!option) {
        errors.push(`Option ${selection.optionName} not found in market ${selection.marketId}`);
        continue;
      }

      // Check if odds match (allow small tolerance for live odds changes)
      const oddsDiff = Math.abs(option.odds.value - selection.odds);
      if (oddsDiff > 0.1) {
        errors.push(`Odds changed for ${selection.optionName}. Current: ${option.odds.value}, Requested: ${selection.odds}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getUserBettingStats(userId: string): Promise<{
    totalBets: number;
    activeBets: number;
    totalStaked: number;
    totalWon: number;
    profit: number;
    roi: number;
    winRate: number;
    favoriteMarketType?: string;
    biggestWin?: number;
    currentStreak: { type: 'win' | 'loss' | 'none'; count: number };
  }> {
    const userBets = await this.betsRepository.findByUserId(new UserId(userId));
    
    const stats = {
      totalBets: userBets.items.length,
      activeBets: 0,
      totalStaked: 0,
      totalWon: 0,
      profit: 0,
      roi: 0,
      winRate: 0,
      biggestWin: 0,
      currentStreak: { type: 'none' as 'win' | 'loss' | 'none', count: 0 }
    };

    let wonBets = 0;
    let lastBetWon: boolean | null = null;
    let streakCount = 0;

    // Sort bets by date for streak calculation
    const sortedBets = [...userBets.items].sort((a, b) => 
      b.createdAt.value.getTime() - a.createdAt.value.getTime()
    );

    for (const bet of userBets.items) {
      stats.totalStaked += bet.amount.value;

      if (bet.status.isPending()) {
        stats.activeBets++;
      } else if (bet.status.isWon()) {
        wonBets++;
        const winAmount = bet.potentialWin;
        stats.totalWon += winAmount;
        
        if (winAmount > stats.biggestWin) {
          stats.biggestWin = winAmount;
        }
      }
    }

    // Calculate streak
    for (const bet of sortedBets) {
      if (bet.status.isPending()) continue;
      
      const currentBetWon = bet.status.isWon();
      
      if (lastBetWon === null) {
        lastBetWon = currentBetWon;
        streakCount = 1;
      } else if (lastBetWon === currentBetWon) {
        streakCount++;
      } else {
        break;
      }
    }

    if (lastBetWon !== null) {
      stats.currentStreak = {
        type: lastBetWon ? 'win' : 'loss',
        count: streakCount
      };
    }

    // Calculate final stats
    stats.profit = stats.totalWon - stats.totalStaked;
    stats.roi = stats.totalStaked > 0 ? (stats.profit / stats.totalStaked) * 100 : 0;
    stats.winRate = userBets.items.length > 0 ? (wonBets / userBets.items.length) * 100 : 0;

    return stats;
  }

  async getPopularMarkets(): Promise<Array<{
    matchId: string;
    marketId: string;
    marketType: string;
    totalBets: number;
    totalVolume: number;
  }>> {
    // This would aggregate betting data to show popular markets
    // For now, return empty array
    return [];
  }

  async getOddsHistory(marketId: string): Promise<Array<{
    timestamp: Date;
    options: Array<{ name: string; odds: number }>;
  }>> {
    // This would track odds changes over time
    // For now, return empty array
    return [];
  }
}