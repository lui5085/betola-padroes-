import { League } from '../entities/league';
import { LeagueId } from '../value-objects/league-id';
import { LeagueCode } from '../value-objects/league-code';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export interface LeagueFilters {
  ownerId?: UserId;
  isPrivate?: boolean;
  search?: string;
}

export interface LeaguesRepository {
  save(league: League): Promise<void>;
  findById(id: LeagueId): Promise<League | null>;
  findByCode(code: LeagueCode): Promise<League | null>;
  findByUserId(userId: UserId): Promise<League[]>;
  findByFilters(filters: LeagueFilters): Promise<League[]>;
  update(league: League): Promise<void>;
}