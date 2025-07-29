import { Title } from '../../../shared/types/title';
import { Description } from '../../../shared/types/description';
import { ImageUrl } from '../../../shared/types/image-url';
import { UserId } from '../../../shared/types/user-id';
import { League } from '../entities/league';
import { LeagueParticipant } from '../entities/league-participant';
import { ILeagueRepository } from '../repositories/league-repository';
import { ILeagueParticipantRepository } from '../repositories/league-participant-repository';

interface CreateLeagueUseCaseRequest {
    title: string;
    description?: string;
    imageUrl?: string;
    ownerId: string;
}

export interface CreateLeagueUseCaseResponse {
    league: League;
    participant: LeagueParticipant;
}

export class CreateLeagueUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
        private leagueParticipantRepository: ILeagueParticipantRepository,
    ) { }

    async execute({
        title,
        description,
        imageUrl,
        ownerId,
    }: CreateLeagueUseCaseRequest): Promise<CreateLeagueUseCaseResponse> {
        const titleVO = new Title(title);
        const descriptionVO = Description.create(description ?? null);
        const imageUrlVO = ImageUrl.create(imageUrl ?? null);
        const ownerIdVO = new UserId(ownerId);

        const league = new League({
            title: titleVO,
            description: descriptionVO,
            imageUrl: imageUrlVO,
            ownerId: ownerIdVO,
        });

        await this.leagueRepository.create(league);

        // Owner entra automaticamente na liga
        const participant = new LeagueParticipant({
            leagueId: league.id,
            userId: ownerIdVO,
        });

        await this.leagueParticipantRepository.create(participant);

        return {
            league,
            participant,
        };
    }
} 