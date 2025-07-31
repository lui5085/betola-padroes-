import { League } from '../entities/league';
import { LeagueId } from '../value-objects/league-id';
import { LeagueCode } from '../value-objects/league-code';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export interface LeagueFilters {
  ownerId?: UserId;
  isPrivate?: boolean;
  search?: string;
}

export interface LeagueMemberDetails {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  totalPoints: number;
  wonBets: number;
  lostBets: number;
  position?: number;
  joinedAt: Date;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface LeaguesRepository {
  save(league: League): Promise<void>;
  findById(id: LeagueId): Promise<League | null>;
  findByCode(code: LeagueCode): Promise<League | null>;
  findByUserId(userId: UserId): Promise<League[]>;
  findByFilters(filters: LeagueFilters): Promise<League[]>;
  findMembersWithUserDetails(leagueId: LeagueId): Promise<LeagueMemberDetails[]>;
  findUserByUsername(username: string): Promise<UserInfo | null>;
  update(league: League): Promise<void>;
  delete(id: LeagueId): Promise<void>;
}