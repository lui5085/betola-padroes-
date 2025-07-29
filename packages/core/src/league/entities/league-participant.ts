import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { randomUUID } from 'crypto';

export class LeagueParticipant {
    id: string;
    leagueId: LeagueId;
    userId: UserId;
    joinedAt: Timestamp;

    constructor(
        params: {
            leagueId: LeagueId;
            userId: UserId;
        },
        id?: string,
        joinedAt?: Timestamp,
    ) {
        this.id = id ?? randomUUID();
        this.leagueId = params.leagueId;
        this.userId = params.userId;
        this.joinedAt = joinedAt ?? new Timestamp(new Date());
    }
} 