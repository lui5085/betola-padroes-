import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { randomUUID } from 'crypto';

export class ChatMessage {
    id: string;
    leagueId: LeagueId;
    userId: UserId;
    message: string;
    createdAt: Timestamp;

    constructor(
        params: {
            leagueId: LeagueId;
            userId: UserId;
            message: string;
        },
        id?: string,
        createdAt?: Timestamp,
    ) {
        this.id = id ?? randomUUID();
        this.leagueId = params.leagueId;
        this.userId = params.userId;
        this.message = params.message;
        this.createdAt = createdAt ?? new Timestamp(new Date());
    }
} 