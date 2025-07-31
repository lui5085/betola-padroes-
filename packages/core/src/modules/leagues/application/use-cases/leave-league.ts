import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';
import { LeagueId } from '../../domain/value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export interface LeaveLeagueRequest {
  leagueId: string;
  userId: string;
}

export interface LeaveLeagueResponse {
  success: boolean;
  message: string;
}

export class LeaveLeagueUseCase implements UseCase<LeaveLeagueRequest, LeaveLeagueResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}
  
  async execute(request: LeaveLeagueRequest): Promise<Result<LeaveLeagueResponse>> {
    try {
      const leagueId = LeagueId.fromString(request.leagueId);
      const userId = UserId.fromString(request.userId);
      
      const league = await this.leaguesRepository.findById(leagueId);
      
      if (!league) {
        return Result.failure('League not found');
      }
      
      if (!league.isMember(userId)) {
        return Result.failure('User is not a member of this league');
      }
      
      if (league.isOwner(userId)) {
        return Result.failure('Owner cannot leave the league. Transfer ownership first or delete the league.');
      }
      
      // Remove member from league
      league.removeMember(userId);
      
      // Save updated league
      await this.leaguesRepository.save(league);
      
      return Result.success({
        success: true,
        message: 'Successfully left the league'
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}