import { Bet } from '../entities/bet';
import { BetId } from '../value-objects/bet-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { BetStatus } from '../value-objects/bet-status';

export interface BetFilters {
  userId?: UserId;
  status?: BetStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedBets {
  items: Bet[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BetsRepository {
  save(bet: Bet): Promise<void>;
  findById(id: BetId): Promise<Bet | null>;
  findByUserId(userId: UserId, filters?: BetFilters): Promise<PaginatedBets>;
  findPendingBets(): Promise<Bet[]>;
  findPendingBetsForMatches(matchIds: string[]): Promise<Bet[]>;
  update(bet: Bet): Promise<void>;
}