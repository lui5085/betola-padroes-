import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { LeaguesRepository, LeagueMemberDetails } from '../../domain/repositories/leagues-repository';
import { LeagueId } from '../../domain/value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export interface GetLeagueDetailsRequest {
  leagueId: string;
  userId: string;
}

export interface GetLeagueDetailsResponse {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  code: string;
  ownerId: string;
  maxMembers: number;
  isPrivate: boolean;
  memberCount: number;
  members: LeagueMemberDetails[];
  userRole?: string;
  isOwner: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class GetLeagueDetailsUseCase implements UseCase<GetLeagueDetailsRequest, GetLeagueDetailsResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}
  
  async execute(request: GetLeagueDetailsRequest): Promise<Result<GetLeagueDetailsResponse>> {
    try {
      const leagueId = LeagueId.fromString(request.leagueId);
      const userId = UserId.fromString(request.userId);
      
      const league = await this.leaguesRepository.findById(leagueId);
      
      if (!league) {
        return Result.failure('League not found');
      }
      
      // Check if user has access to this league
      if (league.isPrivate && !league.isMember(userId)) {
        return Result.failure('Access denied to private league');
      }
      
      const userMember = league.getMember(userId);
      const userRole = userMember?.role.value;
      const isOwner = league.ownerId.equals(userId);
      
      // Get members with their user details (this would need to be implemented in repository)
      const membersWithDetails = await this.leaguesRepository.findMembersWithUserDetails(leagueId);
      
      return Result.success({
        id: league.id.value,
        name: league.name,
        description: league.description,
        imageUrl: league.imageUrl,
        code: league.code.value,
        ownerId: league.ownerId.value,
        maxMembers: league.maxMembers,
        isPrivate: league.isPrivate,
        memberCount: league.memberCount,
        members: membersWithDetails,
        userRole,
        isOwner,
        settings: league.settings,
        createdAt: league.createdAt.value,
        updatedAt: league.updatedAt.value
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}