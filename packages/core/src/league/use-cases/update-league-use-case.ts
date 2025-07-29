import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { Title } from '../../../shared/types/title';
import { Description } from '../../../shared/types/description';
import { ImageUrl } from '../../../shared/types/image-url';
import { League } from '../entities/league';
import { ILeagueRepository } from '../repositories/league-repository';
import { LeagueNotFoundError } from './errors/league-not-found-error';
import { UnauthorizedLeagueOperationError } from './errors/unauthorized-league-operation-error';

interface UpdateLeagueUseCaseRequest {
    leagueId: string;
    userId: string;
    title?: string;
    description?: string;
    imageUrl?: string;
}

export interface UpdateLeagueUseCaseResponse {
    league: League;
}

export class UpdateLeagueUseCase {
    constructor(
        private leagueRepository: ILeagueRepository,
    ) { }

    async execute({
        leagueId,
        userId,
        title,
        description,
        imageUrl,
    }: UpdateLeagueUseCaseRequest): Promise<UpdateLeagueUseCaseResponse> {
        const leagueIdVO = new LeagueId(leagueId);
        const userIdVO = new UserId(userId);

        // Buscar a liga
        const league = await this.leagueRepository.findById(leagueIdVO);
        if (!league) {
            throw new LeagueNotFoundError(leagueId);
        }

        // Verificar se o usuário é o owner
        if (!league.ownerId.equals(userIdVO)) {
            throw new UnauthorizedLeagueOperationError(userId, leagueId, 'atualizar');
        }

        // Criar nova instância da liga com os dados atualizados
        const updatedLeague = new League({
            title: title ? new Title(title) : league.title,
            description: description !== undefined ? Description.create(description) : league.description,
            imageUrl: imageUrl !== undefined ? ImageUrl.create(imageUrl) : league.imageUrl,
            ownerId: league.ownerId,
        }, league.id, league.createdAt);

        await this.leagueRepository.save(updatedLeague);

        return {
            league: updatedLeague,
        };
    }
} 