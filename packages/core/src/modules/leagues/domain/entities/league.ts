import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { LeagueId } from '../value-objects/league-id';
import { LeagueCode } from '../value-objects/league-code';
import { MemberRole, MemberRoleVO } from '../value-objects/member-role';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';
import { LeagueMember } from './league-member';

export interface LeagueProps {
  id: LeagueId;
  name: string;
  description?: string;
  code: LeagueCode;
  ownerId: UserId;
  maxMembers?: number;
  isPrivate?: boolean;
  settings?: Record<string, any>;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class League extends BaseEntity<LeagueId> {
  private readonly _name: string;
  private readonly _description: string;
  private readonly _code: LeagueCode;
  private readonly _ownerId: UserId;
  private readonly _maxMembers: number;
  private readonly _isPrivate: boolean;
  private readonly _settings: Record<string, any>;
  private _members: LeagueMember[];
  
  constructor(props: LeagueProps) {
    super(props.id, props.createdAt, props.updatedAt);
    
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('League name cannot be empty');
    }
    
    if (props.name.length > 100) {
      throw new Error('League name cannot exceed 100 characters');
    }
    
    this._name = props.name.trim();
    this._description = props.description?.trim() || '';
    this._code = props.code;
    this._ownerId = props.ownerId;
    this._maxMembers = props.maxMembers || 100;
    this._isPrivate = props.isPrivate || false;
    this._settings = props.settings || {};
    this._members = [];
  }
  
  static create(props: Omit<LeagueProps, 'id' | 'code'>): League {
    return new League({
      ...props,
      id: LeagueId.create(),
      code: LeagueCode.generate()
    });
  }
  
  get name(): string {
    return this._name;
  }
  
  get description(): string {
    return this._description;
  }
  
  get code(): LeagueCode {
    return this._code;
  }
  
  get ownerId(): UserId {
    return this._ownerId;
  }
  
  get maxMembers(): number {
    return this._maxMembers;
  }
  
  get isPrivate(): boolean {
    return this._isPrivate;
  }
  
  get settings(): Record<string, any> {
    return { ...this._settings };
  }
  
  get members(): readonly LeagueMember[] {
    return [...this._members];
  }
  
  get memberCount(): number {
    return this._members.length;
  }
  
  isFull(): boolean {
    return this._members.length >= this._maxMembers;
  }
  
  isMember(userId: UserId): boolean {
    return this._members.some(member => member.userId.equals(userId));
  }
  
  isOwner(userId: UserId): boolean {
    return this._ownerId.equals(userId);
  }
  
  getMember(userId: UserId): LeagueMember | null {
    return this._members.find(member => member.userId.equals(userId)) || null;
  }
  
  addMember(userId: UserId, role: MemberRoleVO = new MemberRoleVO(MemberRole.MEMBER)): void {
    if (this.isFull()) {
      throw new Error('League is full');
    }
    
    if (this.isMember(userId)) {
      throw new Error('User is already a member');
    }
    
    const member = new LeagueMember({
      id: LeagueMember.generateId(),
      leagueId: this.id,
      userId,
      role
    });
    
    this._members.push(member);
    this.updateTimestamp();
  }
  
  removeMember(userId: UserId): void {
    if (this.isOwner(userId)) {
      throw new Error('Owner cannot leave the league');
    }
    
    const memberIndex = this._members.findIndex(member => member.userId.equals(userId));
    if (memberIndex === -1) {
      throw new Error('User is not a member of this league');
    }
    
    this._members.splice(memberIndex, 1);
    this.updateTimestamp();
  }
  
  promoteToAdmin(userId: UserId, promoterId: UserId): void {
    const promoter = this.getMember(promoterId);
    if (!promoter || !promoter.role.canManageLeague()) {
      throw new Error('Only admins can promote members');
    }
    
    const member = this.getMember(userId);
    if (!member) {
      throw new Error('User is not a member of this league');
    }
    
    if (member.role.isAdmin()) {
      throw new Error('User is already an admin');
    }
    
    member.promoteToAdmin();
    this.updateTimestamp();
  }
  
  demoteFromAdmin(userId: UserId, demoterId: UserId): void {
    if (this.isOwner(userId)) {
      throw new Error('Cannot demote the owner');
    }
    
    const demoter = this.getMember(demoterId);
    if (!demoter || !demoter.role.isOwner()) {
      throw new Error('Only the owner can demote admins');
    }
    
    const member = this.getMember(userId);
    if (!member) {
      throw new Error('User is not a member of this league');
    }
    
    if (!member.role.isAdmin()) {
      throw new Error('User is not an admin');
    }
    
    member.demoteToMember();
    this.updateTimestamp();
  }
  
  getRanking(): LeagueMember[] {
    return [...this._members]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((member, index) => {
        member.updatePosition(index + 1);
        return member;
      });
  }
}