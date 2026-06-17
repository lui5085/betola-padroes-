import { Result } from '../../../../shared/application/result';
import { BetValidationHandler, BetValidationContext } from './bet-validation-handler';
import { WalletsRepository } from '../../../wallet/domain/repositories/wallets-repository';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { BetAmount } from '../../domain/value-objects/bet-amount';

export class BalanceValidationHandler extends BetValidationHandler {
  constructor(private readonly walletsRepository: WalletsRepository) {
    super();
  }

  protected async validate(context: BetValidationContext): Promise<Result<void>> {
    const userId = UserId.fromString(context.userId);
    const betAmount = new BetAmount(context.amount);
    const wallet = await this.walletsRepository.findByUserId(userId);

    if (!wallet) {
      return Result.failure('Wallet not found');
    }

    if (!wallet.canAfford(betAmount)) {
      return Result.failure('Insufficient balance');
    }

    return Result.success(undefined);
  }
}
