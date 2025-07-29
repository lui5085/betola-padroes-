import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { League } from '../entities/league';
import { LeagueParticipant } from '../entities/league-participant';
import { ILeagueRepository } from '../repositories/league-repository';
import { ILeagueParticipantRepository } from '../repositories/league-participant-repository';
import { LeagueNotFoundError } from './errors/league-not-found-error';
import { LeagueFullError } from './errors/league-full-error';
import { UserAlreadyInLeagueError } from './errors/user-already-in-league-error';
import { MAX_LEAGUE_PARTICIPANTS } from '../constants';

interface JoinLeagueUseCaseRequest {
    leagueId: string;
    userId: string;
}

export interface JoinLeagueUseCaseResponse {
    league: League;
    participant: LeagueParticipant;
}

export class JoinLeagueUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
        private leagueParticipantRepository: ILeagueParticipantRepository,
    ) { }

    async execute({
        leagueId,
        userId,
    }: JoinLeagueUseCaseRequest): Promise<JoinLeagueUseCaseResponse> {
        const leagueIdVO = new LeagueId(leagueId);
        const userIdVO = new UserId(userId);

        // Verificar se a liga existe
        const league = await this.leagueRepository.findById(leagueIdVO);
        if (!league) {
            throw new LeagueNotFoundError(leagueId);
        }

        // Verificar se o usuário já está na liga
        const existingParticipant = await this.leagueParticipantRepository.findByLeagueIdAndUserId(
            leagueIdVO,
            userIdVO,
        );
        if (existingParticipant) {
            throw new UserAlreadyInLeagueError(userId, leagueId);
        }

        // Verificar se a liga está cheia
        const participantCount = await this.leagueParticipantRepository.countByLeagueId(leagueIdVO);
        if (participantCount >= MAX_LEAGUE_PARTICIPANTS) {
            throw new LeagueFullError(leagueId);
        }

        // Criar participante
        const participant = new LeagueParticipant({
            leagueId: leagueIdVO,
            userId: userIdVO,
        });

        await this.leagueParticipantRepository.create(participant);

        return {
            league,
            participant,
        };
    }
} 