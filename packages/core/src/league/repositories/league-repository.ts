import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { League } from '../entities/league';

export interface ILeagueRepository {
    create(league: League): Promise<void>;
    findById(id: LeagueId): Promise<League | null>;
    findByOwnerId(ownerId: UserId): Promise<League[]>;
    save(league: League): Promise<void>;
    delete(id: LeagueId): Promise<void>;
} 