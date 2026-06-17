import { BetValidationHandler, BetValidationContext } from './bet-validation-handler';
import { BalanceValidationHandler } from './balance-validation-handler';
import { MatchAvailabilityValidationHandler } from './match-availability-validation-handler';
import { MarketActiveValidationHandler } from './market-active-validation-handler';
import { WalletsRepository } from '../../../wallet/domain/repositories/wallets-repository';
import { MatchesRepository } from '../../../matches/domain/repositories/matches-repository';
import { Result } from '../../../../shared/application/result';

export class BetValidationChain {
  private firstHandler: BetValidationHandler;

  constructor(
    walletsRepository: WalletsRepository,
    matchesRepository: MatchesRepository,
  ) {
    // Build chain: Balance → MatchAvailability → MarketActive
    const balanceHandler = new BalanceValidationHandler(walletsRepository);
    const matchHandler = new MatchAvailabilityValidationHandler(matchesRepository);
    const marketHandler = new MarketActiveValidationHandler();

    balanceHandler.setNext(matchHandler).setNext(marketHandler);

    this.firstHandler = balanceHandler;
  }

  async validate(context: BetValidationContext): Promise<Result<void>> {
    return this.firstHandler.handle(context);
  }
}
