import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { BetId } from '../../domain/value-objects/bet-id';
import { BetAmount } from '../../domain/value-objects/bet-amount';
import { Odds } from '../../domain/value-objects/odds';
import { MarketTypeVO } from '../../domain/value-objects/market-type';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { MatchId } from '../../../matches/domain/value-objects/match-id';
import { BetSelection } from '../../domain/entities/bet-selection';
import { BetFactory } from '../../domain/factories/bet-factory';
import { BetsRepository } from '../../domain/repositories/bets-repository';
import { WalletsRepository } from '../../../wallet/domain/repositories/wallets-repository';
import { MatchesRepository } from '../../../matches/domain/repositories/matches-repository';
import { Money } from '../../../../shared/domain/value-objects/money';

export interface PlaceBetRequest {
  userId: string;
  selections: {
    matchId: string;
    marketType: string;
    selection: string;
    odds: number;
  }[];
  amount: number;
}

export interface PlaceBetResponse {
  betId: string;
  totalOdds: number;
  potentialWin: number;
}

export class PlaceBetUseCase implements UseCase<PlaceBetRequest, PlaceBetResponse> {
  constructor(
    private readonly betsRepository: BetsRepository,
    private readonly walletsRepository: WalletsRepository,
    private readonly matchesRepository: MatchesRepository,
  ) {}

  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    try {
      const userId = UserId.fromString(request.userId);
      const betAmount = new BetAmount(request.amount);

      const wallet = await this.walletsRepository.findByUserId(userId);
      if (!wallet || !wallet.canAfford(betAmount)) {
        return Result.failure('Wallet not found or insufficient balance');
      }

      for (const s of request.selections) {
        const match = await this.matchesRepository.findById(MatchId.fromString(s.matchId));
        if (!match || new Date(match.kickoffTime.value) <= new Date()) {
          return Result.failure(`Match ${s.matchId} is not available for betting.`);
        }
      }

      const betId = BetId.create();
      const selections = request.selections.map(s => new BetSelection({
        betId,
        matchId: MatchId.fromString(s.matchId),
        marketType: new MarketTypeVO(s.marketType as any),
        selection: s.selection,
        odds: new Odds(s.odds)
      }));

      const bet = BetFactory.create({ id: betId, userId, selections, amount: betAmount });
      
      wallet.debit(betAmount);

      // A camada da API será responsável pela transação
      await this.betsRepository.save(bet);
      await this.walletsRepository.update(wallet);

      return Result.success({
        betId: bet.id.value,
        totalOdds: bet.totalOdds.value,
        potentialWin: bet.potentialWin,
      });
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'An error occurred.');
    }
  }
}