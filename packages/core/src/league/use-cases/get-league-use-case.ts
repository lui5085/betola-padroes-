import { LeagueId } from '../../../shared/types/league-id';
import { League } from '../entities/league';
import { ILeagueRepository } from '../repositories/league-repository';
import { LeagueNotFoundError } from './errors/league-not-found-error';

interface GetLeagueUseCaseRequest {
    leagueId: string;
}

export interface GetLeagueUseCaseResponse {
    league: League;
}

export class GetLeagueUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
    ) { }

    async execute({
        leagueId,
    }: GetLeagueUseCaseRequest): Promise<GetLeagueUseCaseResponse> {
        const leagueIdVO = new LeagueId(leagueId);

        const league = await this.leagueRepository.findById(leagueIdVO);
        if (!league) {
            throw new LeagueNotFoundError(leagueId);
        }

        return {
            league,
        };
    }
} 