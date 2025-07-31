import { LeagueInvite } from '../entities/league-invite';
import { LeagueId } from '../value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export interface UserDetails {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface LeagueInvitesRepository {
  save(invite: LeagueInvite): Promise<void>;
  findById(id: string): Promise<LeagueInvite | null>;
  findPendingByLeagueAndUser(leagueId: LeagueId, userId: UserId): Promise<LeagueInvite | null>;
  findPendingByLeagueAndEmail(leagueId: LeagueId, email: string): Promise<LeagueInvite | null>;
  findPendingInvite(leagueId: string, userId: string): Promise<LeagueInvite | null>;
  findByUserId(userId: UserId): Promise<LeagueInvite[]>;
  findByEmail(email: string): Promise<LeagueInvite[]>;
  findByLeagueId(leagueId: LeagueId): Promise<LeagueInvite[]>;
  getUserDetails(userId: UserId): Promise<UserDetails | null>;
  update(invite: LeagueInvite): Promise<void>;
  delete(id: string): Promise<void>;
}