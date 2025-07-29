import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { League } from '../entities/league';
import { ILeagueRepository } from '../repositories/league-repository';
import { LeagueNotFoundError } from './errors/league-not-found-error';
import { UnauthorizedLeagueOperationError } from './errors/unauthorized-league-operation-error';

interface DeleteLeagueUseCaseRequest {
    leagueId: string;
    userId: string;
}

export interface DeleteLeagueUseCaseResponse {
    league: League;
}

export class DeleteLeagueUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
    ) { }

    async execute({
        leagueId,
        userId,
    }: DeleteLeagueUseCaseRequest): Promise<DeleteLeagueUseCaseResponse> {
        const leagueIdVO = new LeagueId(leagueId);
        const userIdVO = new UserId(userId);

        // Buscar a liga
        const league = await this.leagueRepository.findById(leagueIdVO);
        if (!league) {
            throw new LeagueNotFoundError(leagueId);
        }

        // Verificar se o usuário é o owner
        if (!league.ownerId.equals(userIdVO)) {
            throw new UnauthorizedLeagueOperationError(userId, leagueId, 'deletar');
        }

        // Deletar a liga
        await this.leagueRepository.delete(leagueIdVO);

        return {
            league,
        };
    }
} 