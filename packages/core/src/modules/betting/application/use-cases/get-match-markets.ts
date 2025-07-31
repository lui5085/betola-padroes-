import { Result } from '../../../../shared/application/result';
import { MarketsRepository } from '../../domain/repositories/markets-repository';
import { MatchId } from '../../../matches/domain/value-objects/match-id';
import { Market } from '../../domain/entities/market';

export interface GetMatchMarketsRequest {
  matchId: string;
}

export interface GetMatchMarketsResponse {
  markets: {
    id: string;
    type: string;
    name: string;
    selections: {
      name: string;
      value: string;
      odds: number;
      isActive: boolean;
    }[];
    isActive: boolean;
  }[];
}

export class GetMatchMarketsUseCase {
  constructor(private readonly marketsRepository: MarketsRepository) {}

  async execute(request: GetMatchMarketsRequest): Promise<Result<GetMatchMarketsResponse>> {
    try {
      const matchId = new MatchId(request.matchId);
      const markets = await this.marketsRepository.findActiveMarketsForMatch(matchId);

      const response: GetMatchMarketsResponse = {
        markets: markets.map(market => ({
          id: market.id.value,
          type: market.type,
          name: market.name,
          selections: market.options.map(option => ({
            name: option.name,
            value: option.name,
            odds: option.odds.value,
            isActive: !option.isSuspended
          })),
          isActive: market.isActive
        }))
      };

      return Result.success(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to get match markets: ${errorMessage}`);
    }
  }
}