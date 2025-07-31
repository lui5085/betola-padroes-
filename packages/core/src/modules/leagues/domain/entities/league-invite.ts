import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { ID } from '../../../../shared/domain/value-objects/id';
import { LeagueId } from '../value-objects/league-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';
import { randomUUID } from 'crypto';

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

class LeagueInviteId extends ID<LeagueInviteId> {
  static create(): LeagueInviteId {
    return new LeagueInviteId(randomUUID());
  }
}

export interface LeagueInviteProps {
  id: LeagueInviteId;
  leagueId: LeagueId;
  invitedById: UserId;
  invitedUserId?: UserId;
  invitedEmail?: string;
  status: InviteStatus;
  expiresAt: DateTime;
  respondedAt?: DateTime;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class LeagueInvite extends BaseEntity<LeagueInviteId> {
  private readonly _leagueId: LeagueId;
  private readonly _invitedById: UserId;
  private readonly _invitedUserId?: UserId;
  private readonly _invitedEmail?: string;
  private _status: InviteStatus;
  private readonly _expiresAt: DateTime;
  private _respondedAt?: DateTime;

  constructor(props: LeagueInviteProps) {
    super(props.id, props.createdAt, props.updatedAt);
    
    if (!props.invitedUserId && !props.invitedEmail) {
      throw new Error('Either invitedUserId or invitedEmail must be provided');
    }
    
    this._leagueId = props.leagueId;
    this._invitedById = props.invitedById;
    this._invitedUserId = props.invitedUserId;
    this._invitedEmail = props.invitedEmail;
    this._status = props.status;
    this._expiresAt = props.expiresAt;
    this._respondedAt = props.respondedAt;
  }
  
  static create(props: Omit<LeagueInviteProps, 'id' | 'status' | 'expiresAt'>): LeagueInvite {
    const expiresAt = DateTime.now();
    expiresAt.value.setDate(expiresAt.value.getDate() + 7); // Expires in 7 days
    
    return new LeagueInvite({
      ...props,
      id: LeagueInviteId.create(),
      status: InviteStatus.PENDING,
      expiresAt
    });
  }

  get leagueId(): LeagueId {
    return this._leagueId;
  }

  get invitedById(): UserId {
    return this._invitedById;
  }

  get invitedUserId(): UserId | undefined {
    return this._invitedUserId;
  }

  get invitedEmail(): string | undefined {
    return this._invitedEmail;
  }

  get status(): InviteStatus {
    return this._status;
  }

  get expiresAt(): DateTime {
    return this._expiresAt;
  }

  get respondedAt(): DateTime | undefined {
    return this._respondedAt;
  }

  isExpired(): boolean {
    return DateTime.now().value > this._expiresAt.value;
  }

  isPending(): boolean {
    return this._status === InviteStatus.PENDING && !this.isExpired();
  }

  accept(): void {
    if (!this.isPending()) {
      throw new Error('Invite is not pending or has expired');
    }
    
    this._status = InviteStatus.ACCEPTED;
    this._respondedAt = DateTime.now();
    this.updateTimestamp();
  }

  decline(): void {
    if (!this.isPending()) {
      throw new Error('Invite is not pending or has expired');
    }
    
    this._status = InviteStatus.DECLINED;
    this._respondedAt = DateTime.now();
    this.updateTimestamp();
  }

  markAsExpired(): void {
    if (this._status === InviteStatus.PENDING && this.isExpired()) {
      this._status = InviteStatus.EXPIRED;
      this.updateTimestamp();
    }
  }
}