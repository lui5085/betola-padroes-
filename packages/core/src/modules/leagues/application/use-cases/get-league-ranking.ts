import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { LeagueId } from '../../domain/value-objects/league-id';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';

export interface GetLeagueRankingRequest {
  leagueId: string;
  userId?: string; // For checking if user is member
}

export interface LeagueRankingItem {
  position: number;
  userId: string;
  username: string;
  totalPoints: number;
  wonBets: number;
  lostBets: number;
  totalBets: number;
  winRate: number;
  profitMargin: number;
  isCurrentUser?: boolean;
}

export interface GetLeagueRankingResponse {
  leagueId: string;
  leagueName: string;
  ranking: LeagueRankingItem[];
  currentUserPosition?: number;
}

export class GetLeagueRankingUseCase implements UseCase<GetLeagueRankingRequest, GetLeagueRankingResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}
  
  async execute(request: GetLeagueRankingRequest): Promise<Result<GetLeagueRankingResponse>> {
    try {
      const leagueId = LeagueId.fromString(request.leagueId);
      
      // Find league
      const league = await this.leaguesRepository.findById(leagueId);
      if (!league) {
        return Result.failure('League not found');
      }
      
      // Get ranking
      const ranking = league.getRanking();
      
      // Convert to response format
      const rankingItems: LeagueRankingItem[] = ranking.map((member, index) => ({
        position: index + 1,
        userId: member.userId.value,
        username: 'User', // This should come from user repository
        totalPoints: member.totalPoints,
        wonBets: member.wonBets,
        lostBets: member.lostBets,
        totalBets: member.totalBets,
        winRate: member.winRate,
        profitMargin: member.profitMargin,
        isCurrentUser: request.userId ? member.userId.value === request.userId : false
      }));
      
      // Find current user position
      let currentUserPosition: number | undefined;
      if (request.userId) {
        const userRankingItem = rankingItems.find(item => item.userId === request.userId);
        currentUserPosition = userRankingItem?.position;
      }
      
      return Result.success({
        leagueId: league.id.value,
        leagueName: league.name,
        ranking: rankingItems,
        currentUserPosition
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}