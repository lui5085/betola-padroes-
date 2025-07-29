import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { LeagueParticipant } from '../entities/league-participant';

export interface ILeagueParticipantRepository {
    create(participant: LeagueParticipant): Promise<void>;
    findByLeagueId(leagueId: LeagueId): Promise<LeagueParticipant[]>;
    findByUserId(userId: UserId): Promise<LeagueParticipant[]>;
    findByLeagueIdAndUserId(leagueId: LeagueId, userId: UserId): Promise<LeagueParticipant | null>;
    delete(leagueId: LeagueId, userId: UserId): Promise<void>;
    countByLeagueId(leagueId: LeagueId): Promise<number>;
} 