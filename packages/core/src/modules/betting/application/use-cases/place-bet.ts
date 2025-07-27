import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { BetId } from '../../domain/value-objects/bet-id';
import { BetAmount } from '../../domain/value-objects/bet-amount';
import { Odds } from '../../domain/value-objects/odds';
import { MarketTypeVO } from '../../domain/value-objects/market-type';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { MatchId } from '../../../matches/domain/value-objects/match-id';
import { Bet } from '../../domain/entities/bet';
import { BetSelection } from '../../domain/entities/bet-selection';
import { BetsRepository } from '../../domain/repositories/bets-repository';
import { WalletsRepository } from '../../../wallet/domain/repositories/wallets-repository';
import { MatchesRepository } from '../../../matches/domain/repositories/matches-repository';

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
    private readonly matchesRepository: MatchesRepository
  ) {}
  
  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    try {
      // Validate user ID
      const userId = UserId.fromString(request.userId);
      
      // Validate bet amount
      const betAmount = new BetAmount(request.amount);
      
      // Get user's wallet
      const wallet = await this.walletsRepository.findByUserId(userId);
      if (!wallet) {
        return Result.failure('User wallet not found');
      }
      
      // Check if user has sufficient balance
      if (!wallet.balance.canAfford(betAmount)) {
        return Result.failure('Insufficient balance');
      }
      
      // Validate selections
      if (request.selections.length === 0) {
        return Result.failure('At least one selection is required');
      }
      
      if (request.selections.length > 10) {
        return Result.failure('Maximum 10 selections allowed');
      }
      
      // Create bet ID
      const betId = BetId.create();
      
      // Create bet selections
      const selections: BetSelection[] = [];
      
      for (const selectionData of request.selections) {
        // Validate match exists and is available for betting
        const matchId = MatchId.fromString(selectionData.matchId);
        const match = await this.matchesRepository.findById(matchId);
        
        if (!match) {
          return Result.failure(`Match ${selectionData.matchId} not found`);
        }
        
        if (!match.isAvailableForBetting()) {
          return Result.failure(`Match ${selectionData.matchId} is not available for betting`);
        }
        
        // Create selection
        const selection = new BetSelection({
          betId,
          matchId,
          marketType: new MarketTypeVO(selectionData.marketType as any),
          selection: selectionData.selection,
          odds: new Odds(selectionData.odds)
        });
        
        selections.push(selection);
      }
      
      // Create bet
      const bet = new Bet({
        id: betId,
        userId,
        selections,
        amount: betAmount
      });
      
      // Deduct amount from wallet
      wallet.deductBetAmount(betAmount);
      
      // Save bet and wallet
      await this.betsRepository.save(bet);
      await this.walletsRepository.save(wallet);
      
      return Result.success({
        betId: bet.id.value,
        totalOdds: bet.totalOdds.value,
        potentialWin: bet.potentialWin
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}