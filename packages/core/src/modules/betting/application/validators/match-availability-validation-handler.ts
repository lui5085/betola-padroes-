import { Result } from '../../../../shared/application/result';
import { BetValidationHandler, BetValidationContext } from './bet-validation-handler';
import { MatchesRepository } from '../../../matches/domain/repositories/matches-repository';
import { MatchId } from '../../../matches/domain/value-objects/match-id';

export class MatchAvailabilityValidationHandler extends BetValidationHandler {
  constructor(private readonly matchesRepository: MatchesRepository) {
    super();
  }

  protected async validate(context: BetValidationContext): Promise<Result<void>> {
    for (const selection of context.selections) {
      const match = await this.matchesRepository.findById(MatchId.fromString(selection.matchId));

      if (!match) {
        return Result.failure(`Match ${selection.matchId} not found`);
      }

      if (new Date(match.kickoffTime.value) <= new Date()) {
        return Result.failure(`Match ${selection.matchId} has already started`);
      }
    }

    return Result.success(undefined);
  }
}
