import { LeagueId } from '../../../shared/types/league-id';
import { Title } from '../../../shared/types/title';
import { Description } from '../../../shared/types/description';
import { ImageUrl } from '../../../shared/types/image-url';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';
import { randomUUID } from 'crypto';

export class League {
    id: LeagueId;
    title: Title;
    description: Description;
    imageUrl: ImageUrl;
    ownerId: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;

    constructor(
        params: {
            title: Title;
            description: Description;
            imageUrl: ImageUrl;
            ownerId: UserId;
        },
        id?: LeagueId,
        createdAt?: Timestamp,
        updatedAt?: Timestamp,
    ) {
        this.id = id ?? new LeagueId(randomUUID());
        this.title = params.title;
        this.description = params.description;
        this.imageUrl = params.imageUrl;
        this.ownerId = params.ownerId;
        this.createdAt = createdAt ?? new Timestamp(new Date());
        this.updatedAt = updatedAt ?? new Timestamp(new Date());
    }
} 