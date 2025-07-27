import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { LeagueCode } from '../../domain/value-objects/league-code';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';

export interface JoinLeagueRequest {
  userId: string;
  leagueCode: string;
}

export interface JoinLeagueResponse {
  leagueId: string;
  leagueName: string;
  memberCount: number;
}

export class JoinLeagueUseCase implements UseCase<JoinLeagueRequest, JoinLeagueResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}
  
  async execute(request: JoinLeagueRequest): Promise<Result<JoinLeagueResponse>> {
    try {
      // Validate input
      if (!request.leagueCode || request.leagueCode.trim().length === 0) {
        return Result.failure('League code is required');
      }
      
      const userId = UserId.fromString(request.userId);
      const leagueCode = new LeagueCode(request.leagueCode.toUpperCase());
      
      // Find league by code
      const league = await this.leaguesRepository.findByCode(leagueCode);
      if (!league) {
        return Result.failure('League not found');
      }
      
      // Check if user is already a member
      if (league.isMember(userId)) {
        return Result.failure('You are already a member of this league');
      }
      
      // Check if league is full
      if (league.isFull()) {
        return Result.failure('League is full');
      }
      
      // Add user as member
      league.addMember(userId);
      
      // Save league
      await this.leaguesRepository.update(league);
      
      return Result.success({
        leagueId: league.id.value,
        leagueName: league.name,
        memberCount: league.memberCount
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}