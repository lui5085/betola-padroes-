import { Market } from '../entities/market';
import { MarketId } from '../value-objects/market-id';
import { MatchId } from '../../../matches/domain/value-objects/match-id';
import { MarketType } from '../value-objects/market-type';

export interface MarketsRepository {
  save(market: Market): Promise<void>;
  findById(id: MarketId): Promise<Market | null>;
  findByMatch(matchId: MatchId): Promise<Market[]>;
  findByMatchAndType(matchId: MatchId, type: MarketType): Promise<Market | null>;
  findActiveByMatch(matchId: MatchId): Promise<Market[]>;
  findActiveMarketsForMatch(matchId: MatchId): Promise<Market[]>;
  update(market: Market): Promise<void>;
  deactivateByMatch(matchId: MatchId): Promise<void>;
  delete(id: MarketId): Promise<void>;
}