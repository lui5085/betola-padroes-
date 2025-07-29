import { LeagueId } from '../../../shared/types/league-id';
import { LeagueParticipant } from '../entities/league-participant';
import { ILeagueRepository } from '../repositories/league-repository';
import { ILeagueParticipantRepository } from '../repositories/league-participant-repository';
import { LeagueNotFoundError } from './errors/league-not-found-error';

interface ListLeagueParticipantsUseCaseRequest {
    leagueId: string;
}

export interface ListLeagueParticipantsUseCaseResponse {
    participants: LeagueParticipant[];
}

export class ListLeagueParticipantsUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
        private leagueParticipantRepository: ILeagueParticipantRepository,
    ) { }

    async execute({
        leagueId,
    }: ListLeagueParticipantsUseCaseRequest): Promise<ListLeagueParticipantsUseCaseResponse> {
        const leagueIdVO = new LeagueId(leagueId);

        // Verificar se a liga existe
        const league = await this.leagueRepository.findById(leagueIdVO);
        if (!league) {
            throw new LeagueNotFoundError(leagueId);
        }

        const participants = await this.leagueParticipantRepository.findByLeagueId(leagueIdVO);

        return {
            participants,
        };
    }
} 