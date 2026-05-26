import { Result } from '../../../../shared/application/result';
import { PlaceBetRequest, PlaceBetResponse } from '../use-cases/place-bet';
import { PlaceBetDecorator } from './place-bet-decorator';

export class LoggingPlaceBetDecorator extends PlaceBetDecorator {
  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    console.log(
      `[BetLog] User ${request.userId} attempting bet of ${request.amount} betoletas ` +
      `with ${request.selections.length} selection(s)`,
    );

    const result = await this.wrapped.execute(request);

    if (result.isSuccess()) {
      console.log(
        `[BetLog] Bet placed successfully: id=${result.value.betId} ` +
        `totalOdds=${result.value.totalOdds} potentialWin=${result.value.potentialWin}`,
      );
    } else {
      console.warn(`[BetLog] Bet failed for user ${request.userId}: ${result.error}`);
    }

    return result;
  }
}
