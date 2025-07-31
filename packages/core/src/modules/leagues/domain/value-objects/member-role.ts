export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export class MemberRoleVO {
  constructor(private readonly _value: MemberRole) {}
  
  get value(): MemberRole {
    return this._value;
  }
  
  isOwner(): boolean {
    return this._value === MemberRole.OWNER;
  }
  
  isAdmin(): boolean {
    return this._value === MemberRole.ADMIN;
  }
  
  isMember(): boolean {
    return this._value === MemberRole.MEMBER;
  }
  
  canManageLeague(): boolean {
    return this.isOwner() || this.isAdmin();
  }
  
  canInviteMembers(): boolean {
    return this.isOwner() || this.isAdmin();
  }
  
  canKickMembers(): boolean {
    return this.isOwner() || this.isAdmin();
  }
  
  equals(other: MemberRoleVO): boolean {
    return this._value === other._value;
  }
  
  toString(): string {
    return this._value;
  }
}