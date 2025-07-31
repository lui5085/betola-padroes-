import { Result } from '../../../../shared/application/result';
import { BetsRepository } from '../../domain/repositories/bets-repository';
import { MatchesRepository } from '../../../matches/domain/repositories/matches-repository';
import { WalletsRepository } from '../../../wallet/domain/repositories/wallets-repository';
import { Money } from '../../../../shared/domain/value-objects/money';

export interface SettleBetsResponse {
  settledCount: number;
  errors: string[];
}

export class SettleBetsUseCase {
  constructor(
    private readonly betsRepository: BetsRepository,
    private readonly matchesRepository: MatchesRepository,
    private readonly walletsRepository: WalletsRepository
  ) {}

  async execute(): Promise<Result<SettleBetsResponse>> {
    try {
      const matchesToSettle = await this.matchesRepository.findSettlementPending();

      let settledCount = 0;
      const errors: string[] = [];

      for (const match of matchesToSettle) {
        if (!match.isFinished()) continue;

        const matchResult = match.getResult();
        if (!matchResult) continue;

        // Find all pending bets for this match
        const pendingBets = await this.betsRepository.findPendingByMatch(match.id);

        for (const bet of pendingBets) {
          try {
            const isWon = bet.evaluate(match.id.value, matchResult); // Corrigido para .value
            bet.settle(isWon); // Passando o boolean correto

            if (isWon) {
              const wallet = await this.walletsRepository.findByUserId(bet.userId);
              if (wallet) {
                wallet.credit(new Money(bet.potentialWin));
                await this.walletsRepository.update(wallet);
              }
            }
            await this.betsRepository.update(bet);
            settledCount++;

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            errors.push(`Failed to settle bet ${bet.id.value}: ${errorMessage}`);
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

}