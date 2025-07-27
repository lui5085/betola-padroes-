import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@betola/core/shared/application/result';
import { BetsRepository } from '@betola/core/modules/betting/domain/repositories/bets-repository';
import { MatchesRepository } from '@betola/core/modules/matches/domain/repositories/matches-repository';
import { WalletsRepository } from '@betola/core/modules/wallet/domain/repositories/wallets-repository';
import { MarketType } from '@betola/core/modules/betting/domain/value-objects/market-type';

export interface SettleBetsResponse {
  settledCount: number;
  errors: string[];
}

@Injectable()
export class SettleBetsUseCase {
  constructor(
    @Inject('BetsRepository')
    private readonly betsRepository: BetsRepository,
    @Inject('MatchesRepository')
    private readonly matchesRepository: MatchesRepository,
    @Inject('WalletsRepository')
    private readonly walletsRepository: WalletsRepository
  ) {}

  async execute(): Promise<Result<SettleBetsResponse>> {
    try {
      // Find all finished matches with pending bets
      const finishedMatches = await this.matchesRepository.findFinishedWithPendingBets();
      
      let settledCount = 0;
      const errors: string[] = [];

      for (const match of finishedMatches) {
        const matchResult = match.getResult();
        if (!matchResult) continue;

        // Find all pending bets for this match
        const pendingBets = await this.betsRepository.findPendingByMatch(match.id);

        for (const bet of pendingBets) {
          try {
            // Check each selection
            let allSelectionsSettled = true;
            let hasWinningSelection = true;

            for (const selection of bet.selections) {
              if (selection.matchId.equals(match.id)) {
                const isWinner = this.checkSelectionResult(
                  selection.marketType,
                  selection.optionName,
                  matchResult
                );

                if (isWinner) {
                  selection.markAsWon();
                } else {
                  selection.markAsLost();
                  hasWinningSelection = false;
                }
              }

              if (selection.isPending()) {
                allSelectionsSettled = false;
              }
            }

            // If all selections are settled, settle the bet
            if (allSelectionsSettled) {
              if (hasWinningSelection) {
                bet.markAsWon();
                
                // Credit winnings to wallet
                const wallet = await this.walletsRepository.findByUserId(bet.userId);
                if (wallet) {
                  wallet.credit(bet.potentialReturn);
                  await this.walletsRepository.save(wallet);
                }
              } else {
                bet.markAsLost();
              }

              await this.betsRepository.save(bet);
              settledCount++;
            }

          } catch (error) {
            errors.push(`Failed to settle bet ${bet.id.value}: ${error.message}`);
          }
        }
      }

      return Result.success({
        settledCount,
        errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to settle bets: ${errorMessage}`);
    }
  }

  private checkSelectionResult(
    marketType: MarketType,
    optionName: string,
    matchResult: any
  ): boolean {
    switch (marketType) {
      case MarketType.MATCH_WINNER:
        if (optionName === 'Home' && matchResult.homeWin) return true;
        if (optionName === 'Draw' && matchResult.draw) return true;
        if (optionName === 'Away' && matchResult.awayWin) return true;
        return false;

      case MarketType.BOTH_TEAMS_SCORE:
        if (optionName === 'Yes' && matchResult.bothTeamsScored) return true;
        if (optionName === 'No' && !matchResult.bothTeamsScored) return true;
        return false;

      case MarketType.OVER_UNDER_GOALS:
        const [overUnder, line] = optionName.split(' ');
        const goalLine = parseFloat(line);
        
        if (overUnder === 'Over' && matchResult.totalGoals > goalLine) return true;
        if (overUnder === 'Under' && matchResult.totalGoals < goalLine) return true;
        return false;

      case MarketType.CORRECT_SCORE:
        const [homeGoals, awayGoals] = optionName.split('-').map(n => parseInt(n));
        return matchResult.homeScore === homeGoals && matchResult.awayScore === awayGoals;

      case MarketType.TOTAL_GOALS:
        return matchResult.totalGoals === parseInt(optionName);

      case MarketType.ODD_EVEN_GOALS:
        const isOdd = matchResult.totalGoals % 2 === 1;
        if (optionName === 'Odd' && isOdd) return true;
        if (optionName === 'Even' && !isOdd) return true;
        return false;

      default:
        return false;
    }
  }
}