import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';
import { LeagueId } from '../../domain/value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export interface UpdateMemberStatsRequest {
  leagueId: string;
  userId: string;
  points: number;
  isWin: boolean;
}

export interface UpdateMemberStatsResponse {
  success: boolean;
  newTotalPoints: number;
  newPosition?: number;
}

export class UpdateMemberStatsUseCase implements UseCase<UpdateMemberStatsRequest, UpdateMemberStatsResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}
  
  async execute(request: UpdateMemberStatsRequest): Promise<Result<UpdateMemberStatsResponse>> {
    try {
      const leagueId = LeagueId.fromString(request.leagueId);
      const userId = UserId.fromString(request.userId);
      
      const league = await this.leaguesRepository.findById(leagueId);
      
      if (!league) {
        return Result.failure('League not found');
      }
      
      const member = league.getMember(userId);
      if (!member) {
        return Result.failure('User is not a member of this league');
      }
      
      // Update member stats
      if (request.isWin) {
        member.addWonBet(request.points);
      } else {
        member.addLostBet();
      }
      
      // Recalculate ranking
      const ranking = league.getRanking();
      const updatedMember = ranking.find(m => m.userId.equals(userId));
      
      // Save updated league
      await this.leaguesRepository.save(league);
      
      return Result.success({
        success: true,
        newTotalPoints: member.totalPoints,
        newPosition: updatedMember?.position
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}