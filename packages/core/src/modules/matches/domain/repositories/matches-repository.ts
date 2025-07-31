import { Match } from '../entities/match';
import { MatchId } from '../value-objects/match-id';
import { MatchStatus } from '../value-objects/match-status';

export interface MatchFilters {
  status?: MatchStatus;
  upcoming?: boolean;
  date?: Date;
}

export interface MatchesRepository {
  save(match: Match): Promise<void>;
  findById(id: MatchId): Promise<Match | null>;
  findByExternalId(externalId: string): Promise<Match | null>;
  findUpcoming(limit?: number): Promise<Match[]>;
  findByFilters(filters: MatchFilters): Promise<Match[]>;
  findByStatus(status: MatchStatus): Promise<Match[]>;
  findAvailableForBetting(): Promise<Match[]>;
  findFinishedWithPendingBets(): Promise<Match[]>;
  findSettlementPending(): Promise<Match[]>;
  update(match: Match): Promise<void>;
  upsert(match: Match): Promise<void>;
}