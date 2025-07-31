import { UseCase } from '../../../../shared/application/use-case';
import { Result } from '../../../../shared/application/result';
import { LeaguesRepository } from '../../domain/repositories/leagues-repository';
import { LeagueInvitesRepository } from '../../domain/repositories/league-invites-repository';
import { LeagueId } from '../../domain/value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { LeagueInvite } from '../../domain/entities/league-invite';

export interface CreateLeagueInviteRequest {
  leagueId: string;
  inviterId: string;
  invitedUserId?: string;
  invitedEmail?: string;
}

export interface CreateLeagueInviteResponse {
  inviteId: string;
  leagueName: string;
  inviterUsername: string;
  expiresAt: Date;
  message: string;
}

export class CreateLeagueInviteUseCase implements UseCase<CreateLeagueInviteRequest, CreateLeagueInviteResponse> {
  constructor(
    private readonly leaguesRepository: LeaguesRepository,
    private readonly invitesRepository: LeagueInvitesRepository
  ) {}
  
  async execute(request: CreateLeagueInviteRequest): Promise<Result<CreateLeagueInviteResponse>> {
    try {
      const leagueId = LeagueId.fromString(request.leagueId);
      const inviterId = UserId.fromString(request.inviterId);
      
      // Validate league exists and user has permission to invite
      const league = await this.leaguesRepository.findById(leagueId);
      if (!league) {
        return Result.failure('League not found');
      }
      
      const inviter = league.getMember(inviterId);
      if (!inviter || !inviter.role.canInviteMembers()) {
        return Result.failure('You do not have permission to invite members to this league');
      }
      
      // Check if league is full
      if (league.isFull()) {
        return Result.failure('League is full');
      }
      
      let invitedUserId: UserId | undefined;
      if (request.invitedUserId) {
        invitedUserId = UserId.fromString(request.invitedUserId);
        
        // Check if user is already a member
        if (league.isMember(invitedUserId)) {
          return Result.failure('User is already a member of this league');
        }
        
        // Check for existing pending invite
        const existingInvite = await this.invitesRepository.findPendingByLeagueAndUser(leagueId, invitedUserId);
        if (existingInvite) {
          return Result.failure('User already has a pending invite to this league');
        }
      }
      
      if (request.invitedEmail) {
        // Check for existing pending invite by email
        const existingInvite = await this.invitesRepository.findPendingByLeagueAndEmail(leagueId, request.invitedEmail);
        if (existingInvite) {
          return Result.failure('An invite has already been sent to this email address');
        }
      }
      
      // Create invite
      const invite = LeagueInvite.create({
        leagueId,
        invitedById: inviterId,
        invitedUserId,
        invitedEmail: request.invitedEmail
      });
      
      // Save invite
      await this.invitesRepository.save(invite);
      
      // Get inviter details for response
      const inviterDetails = await this.invitesRepository.getUserDetails(inviterId);
      
      return Result.success({
        inviteId: invite.id.value,
        leagueName: league.name,
        inviterUsername: inviterDetails?.username || 'Unknown',
        expiresAt: invite.expiresAt.value,
        message: 'Invite sent successfully'
      });
      
    } catch (error) {
      return Result.failure(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}