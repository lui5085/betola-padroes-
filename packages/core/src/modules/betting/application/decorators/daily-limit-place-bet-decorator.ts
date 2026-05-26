import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { PlaceBetRequest, PlaceBetResponse } from '../use-cases/place-bet';
import { PlaceBetDecorator } from './place-bet-decorator';
import { BetsRepository } from '../../domain/repositories/bets-repository';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export class DailyLimitPlaceBetDecorator extends PlaceBetDecorator {
  private static readonly MAX_BETS_PER_DAY = 10;

  constructor(
    wrapped: UseCase<PlaceBetRequest, PlaceBetResponse>,
    private readonly betsRepository: BetsRepository,
  ) {
    super(wrapped);
  }

  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    const userId = UserId.fromString(request.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyCount = await this.betsRepository.countByUserSince(userId, today);

    if (dailyCount >= DailyLimitPlaceBetDecorator.MAX_BETS_PER_DAY) {
      return Result.failure(
        `Daily bet limit of ${DailyLimitPlaceBetDecorator.MAX_BETS_PER_DAY} bets reached. Try again tomorrow.`,
      );
    }

    return this.wrapped.execute(request);
  }
}
