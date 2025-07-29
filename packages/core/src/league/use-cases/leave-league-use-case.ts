import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { League } from '../entities/league';
import { ILeagueRepository } from '../repositories/league-repository';
import { ILeagueParticipantRepository } from '../repositories/league-participant-repository';
import { LeagueNotFoundError } from './errors/league-not-found-error';
import { UserNotInLeagueError } from './errors/user-not-in-league-error';
import { UnauthorizedLeagueOperationError } from './errors/unauthorized-league-operation-error';

interface LeaveLeagueUseCaseRequest {
    leagueId: string;
    userId: string;
}

export interface LeaveLeagueUseCaseResponse {
    league: League;
}

export class LeaveLeagueUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
        private leagueParticipantRepository: ILeagueParticipantRepository,
    ) { }

    async execute({
        leagueId,
        userId,
    }: LeaveLeagueUseCaseRequest): Promise<LeaveLeagueUseCaseResponse> {
        const leagueIdVO = new LeagueId(leagueId);
        const userIdVO = new UserId(userId);

        // Verificar se a liga existe
        const league = await this.leagueRepository.findById(leagueIdVO);
        if (!league) {
            throw new LeagueNotFoundError(leagueId);
        }

        // Verificar se o usuário está na liga
        const participant = await this.leagueParticipantRepository.findByLeagueIdAndUserId(
            leagueIdVO,
            userIdVO,
        );
        if (!participant) {
            throw new UserNotInLeagueError(userId, leagueId);
        }

        // Verificar se o usuário não é o owner (owner não pode sair)
        if (league.ownerId.equals(userIdVO)) {
            throw new UnauthorizedLeagueOperationError(userId, leagueId, 'sair da liga');
        }

        // Remover participante
        await this.leagueParticipantRepository.delete(leagueIdVO, userIdVO);

        return {
            league,
        };
    }
} 