import { UserId } from '../../../shared/types/user-id';
import { League } from '../entities/league';
import { ILeagueRepository } from '../repositories/league-repository';

interface ListUserLeaguesUseCaseRequest {
    userId: string;
}

export interface ListUserLeaguesUseCaseResponse {
    leagues: League[];
}

export class ListUserLeaguesUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
    ) { }

    async execute({
        userId,
    }: ListUserLeaguesUseCaseRequest): Promise<ListUserLeaguesUseCaseResponse> {
        const userIdVO = new UserId(userId);

        const leagues = await this.leagueRepository.findByOwnerId(userIdVO);

        return {
            leagues,
        };
    }
} 