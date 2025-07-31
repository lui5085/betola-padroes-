import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';
import { LeagueInvitesRepository } from '../../domain/repositories/league-invites-repository';
import { LeagueId } from '../../domain/value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { LeagueInvite } from '../../domain/entities/league-invite';

export interface InviteUserByUsernameRequest {
  leagueId: string;
  inviterId: string;
  username: string;
}

export interface InviteUserByUsernameResponse {
  inviteId: string;
  invitedUsername: string;
  leagueName: string;
  expiresAt: Date;
  message: string;
}

export class InviteUserByUsernameUseCase implements UseCase<InviteUserByUsernameRequest, InviteUserByUsernameResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository,
    private readonly invitesRepository: LeagueInvitesRepository
  ) {}
  
  async execute(request: InviteUserByUsernameRequest): Promise<Result<InviteUserByUsernameResponse>> {
    try {
      const leagueId = LeagueId.fromString(request.leagueId);
      const inviterId = UserId.fromString(request.inviterId);
      
      // Validate league exists and user has permission to invite
      const league = await this.leaguesRepository.findById(leagueId);
      if (!league) {
        return Result.failure('League not found');
      }
      
      const inviter = league.getMember(inviterId);
      if (!inviter) {
        return Result.failure('You are not a member of this league');
      }
      
      // Check if user has permission to invite (owner or admin)
      const isOwner = league.ownerId.equals(inviterId);
      const isAdmin = inviter.role.value === 'ADMIN';
      
      if (!isOwner && !isAdmin) {
        return Result.failure('Only league owners and admins can invite members');
      }
      
      // Check if league is full
      if (league.memberCount >= league.maxMembers) {
        return Result.failure('League is full');
      }
      
      // Find user by username
      const invitedUser = await this.leaguesRepository.findUserByUsername(request.username);
      if (!invitedUser) {
        return Result.failure(`User '${request.username}' not found`);
      }
      
      const invitedUserId = UserId.fromString(invitedUser.id);
      
      // Check if user is already a member
      if (league.isMember(invitedUserId)) {
        return Result.failure(`${request.username} is already a member of this league`);
      }
      
      // Check for existing pending invite
      const existingInvite = await this.invitesRepository.findPendingByLeagueAndUser(leagueId, invitedUserId);
      if (existingInvite) {
        return Result.failure(`${request.username} already has a pending invite to this league`);
      }
      
      // Create invite
      const invite = LeagueInvite.create({
        leagueId,
        invitedById: inviterId,
        invitedUserId,
      });
      
      // Save invite
      await this.invitesRepository.save(invite);
      
      return Result.success({
        inviteId: invite.id.value,
        invitedUsername: request.username,
        leagueName: league.name,
        expiresAt: invite.expiresAt.value,
        message: `Invite sent to ${request.username} successfully`
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}