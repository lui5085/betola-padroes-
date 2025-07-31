import { Result } from '../../../../shared/application/result';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';
import { LeagueId } from '../../domain/value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';

interface UpdateLeagueRequest {
  leagueId: string;
  userId: string; // User requesting the update (must be owner)
  name?: string;
  description?: string;
  imageUrl?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface UpdateLeagueResponse {
  success: boolean;
  message: string;
}

export class UpdateLeagueUseCase {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}

  async execute(request: UpdateLeagueRequest): Promise<Result<UpdateLeagueResponse>> {
    try {
      // Validate IDs
      const leagueId = new LeagueId(request.leagueId);
      const userId = new UserId(request.userId);

      // Get league
      const league = await this.leaguesRepository.findById(leagueId);
      if (!league) {
        return Result.failure('Liga não encontrada');
      }

      // Check if user is the owner
      if (!league.ownerId.equals(userId)) {
        return Result.failure('Apenas o dono da liga pode editá-la');
      }

      // Update league properties
      if (request.name !== undefined) {
        league.updateName(request.name);
      }

      if (request.description !== undefined) {
        league.updateDescription(request.description);
      }

      if (request.imageUrl !== undefined) {
        league.updateImageUrl(request.imageUrl);
      }

      if (request.isPrivate !== undefined) {
        league.updatePrivacy(request.isPrivate);
      }

      if (request.maxMembers !== undefined) {
        league.updateMaxMembers(request.maxMembers);
      }

      // Save updated league
      await this.leaguesRepository.save(league);

      return Result.success({
        success: true,
        message: 'Liga atualizada com sucesso'
      });

    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Erro interno do servidor');
    }
  }
}