import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { ID } from '../../../../shared/domain/value-objects/id';
import { LeagueId } from '../value-objects/league-id';
import { MemberRole, MemberRoleVO } from '../value-objects/member-role';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';
import { randomUUID } from 'crypto';

class LeagueMemberId extends ID<LeagueMemberId> {
  static create(): LeagueMemberId {
    return new LeagueMemberId(randomUUID());
  }
}

export interface LeagueMemberProps {
  id: LeagueMemberId;
  leagueId: LeagueId;
  userId: UserId;
  role: MemberRoleVO;
  totalPoints?: number;
  wonBets?: number;
  lostBets?: number;
  joinedAt?: DateTime;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class LeagueMember extends BaseEntity<LeagueMemberId> {
  private readonly _leagueId: LeagueId;
  private readonly _userId: UserId;
  private _role: MemberRoleVO;
  private _totalPoints: number;
  private _wonBets: number;
  private _lostBets: number;
  private readonly _joinedAt: DateTime;
  private _position?: number;
  
  constructor(props: LeagueMemberProps) {
    super(props.id, props.createdAt, props.updatedAt);
    
    this._leagueId = props.leagueId;
    this._userId = props.userId;
    this._role = props.role;
    this._totalPoints = props.totalPoints || 0;
    this._wonBets = props.wonBets || 0;
    this._lostBets = props.lostBets || 0;
    this._joinedAt = props.joinedAt || DateTime.now();
  }
  
  static generateId(): LeagueMemberId {
    return LeagueMemberId.create();
  }
  
  get leagueId(): LeagueId {
    return this._leagueId;
  }
  
  get userId(): UserId {
    return this._userId;
  }
  
  get role(): MemberRoleVO {
    return this._role;
  }
  
  get totalPoints(): number {
    return this._totalPoints;
  }
  
  get wonBets(): number {
    return this._wonBets;
  }
  
  get lostBets(): number {
    return this._lostBets;
  }
  
  get totalBets(): number {
    return this._wonBets + this._lostBets;
  }
  
  get winRate(): number {
    if (this.totalBets === 0) return 0;
    return (this._wonBets / this.totalBets) * 100;
  }
  
  get joinedAt(): DateTime {
    return this._joinedAt;
  }
  
  get position(): number | undefined {
    return this._position;
  }
  
  addWonBet(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }
    
    this._totalPoints += points;
    this._wonBets += 1;
    this.updateTimestamp();
  }
  
  addLostBet(): void {
    this._lostBets += 1;
    this.updateTimestamp();
  }
  
  promoteToAdmin(): void {
    if (this._role.isAdmin() || this._role.isOwner()) {
      throw new Error('Member is already an admin or owner');
    }
    
    this._role = new MemberRoleVO(MemberRole.ADMIN);
    this.updateTimestamp();
  }
  
  demoteToMember(): void {
    if (this._role.isOwner()) {
      throw new Error('Cannot demote the owner');
    }
    
    if (this._role.isMember()) {
      throw new Error('Member is already a regular member');
    }
    
    this._role = new MemberRoleVO(MemberRole.MEMBER);
    this.updateTimestamp();
  }
  
  updatePosition(position: number): void {
    this._position = position;
  }
  
  get profitMargin(): number {
    if (this.totalBets === 0) return 0;
    
    // Calculate profit margin based on average odds and win rate
    // This is a simplified calculation for demonstration
    const averageOdds = 2.0; // This should come from actual bet data
    const expectedReturn = this._wonBets * averageOdds;
    const totalStaked = this.totalBets * 100; // Assuming average bet of 100 betoletas
    
    return ((expectedReturn - totalStaked) / totalStaked) * 100;
  }
}