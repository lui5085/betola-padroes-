import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { League } from '../../domain/entities/league';
import { LeagueId } from '../../domain/value-objects/league-id';
import { LeagueCode } from '../../domain/value-objects/league-code';
import { MemberRole, MemberRoleVO } from '../../domain/value-objects/member-role';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';

export interface CreateLeagueRequest {
  ownerId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  maxMembers?: number;
  isPrivate?: boolean;
}

export interface CreateLeagueResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  imageUrl: string;
  maxMembers: number;
  isPrivate: boolean;
}

export class CreateLeagueUseCase implements UseCase<CreateLeagueRequest, CreateLeagueResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository
  ) {}
  
  async execute(request: CreateLeagueRequest): Promise<Result<CreateLeagueResponse>> {
    try {
      // Validate input
      if (!request.name || request.name.trim().length === 0) {
        return Result.failure('League name is required');
      }
      
      if (request.name.length > 100) {
        return Result.failure('League name cannot exceed 100 characters');
      }
      
      const ownerId = UserId.fromString(request.ownerId);
      
      // Create league
      const league = League.create({
        name: request.name,
        description: request.description,
        imageUrl: request.imageUrl,
        ownerId,
        maxMembers: request.maxMembers,
        isPrivate: request.isPrivate
      });
      
      // Owner automatically becomes a member with OWNER role
      league.addMember(ownerId, new MemberRoleVO(MemberRole.OWNER));
      
      // Save league
      await this.leaguesRepository.save(league);
      
      return Result.success({
        id: league.id.value,
        name: league.name,
        code: league.code.value,
        description: league.description,
        imageUrl: league.imageUrl,
        maxMembers: league.maxMembers,
        isPrivate: league.isPrivate
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}