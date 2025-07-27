import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';

export interface GetUserLeaguesRequest {
  userId: string;
}

export interface UserLeagueItem {
  id: string;
  name: string;
  code: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  isOwner: boolean;
  userRole: string;
  userPosition?: number;
  userPoints: number;
}

export interface GetUserLeaguesResponse {
  leagues: UserLeagueItem[];
}

export class GetUserLeaguesUseCase implements UseCase<GetUserLeaguesRequest, GetUserLeaguesResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}
  
  async execute(request: GetUserLeaguesRequest): Promise<Result<GetUserLeaguesResponse>> {
    try {
      const userId = UserId.fromString(request.userId);
      
      // Find all leagues where user is a member
      const leagues = await this.leaguesRepository.findByUserId(userId);
      
      // Convert to response format
      const userLeagues: UserLeagueItem[] = leagues.map(league => {
        const member = league.getMember(userId);
        const ranking = league.getRanking();
        const userRanking = ranking.find(r => r.userId.equals(userId));
        
        return {
          id: league.id.value,
          name: league.name,
          code: league.code.value,
          description: league.description,
          memberCount: league.memberCount,
          maxMembers: league.maxMembers,
          isOwner: league.isOwner(userId),
          userRole: member?.role.value || 'MEMBER',
          userPosition: userRanking?.position,
          userPoints: member?.totalPoints || 0
        };
      });
      
      return Result.success({
        leagues: userLeagues
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}