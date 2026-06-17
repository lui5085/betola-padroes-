import { Result } from '../../../../shared/application/result';
import { BetValidationHandler, BetValidationContext } from './bet-validation-handler';

export class MarketActiveValidationHandler extends BetValidationHandler {
  protected async validate(context: BetValidationContext): Promise<Result<void>> {
    for (const selection of context.selections) {
      if (!selection.odds || selection.odds < 1.01) {
        return Result.failure(
          `Invalid odds for selection in match ${selection.matchId}: odds must be at least 1.01`,
        );
      }

      if (!selection.marketType || !selection.selection) {
        return Result.failure(
          `Invalid market data for selection in match ${selection.matchId}`,
        );
      }
    }

    return Result.success(undefined);
  }
}
