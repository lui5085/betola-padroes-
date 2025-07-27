import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLeagueResponse, UserLeagueItem } from '@betola/core';

export class LeagueResponseDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  code: string;
  
  @ApiProperty()
  description: string;
  
  @ApiProperty()
  memberCount: number;
  
  @ApiProperty()
  maxMembers: number;
  
  @ApiProperty()
  isPrivate: boolean;
  
  @ApiPropertyOptional()
  isOwner?: boolean;
  
  @ApiPropertyOptional()
  userRole?: string;
  
  @ApiPropertyOptional()
  userPosition?: number;
  
  @ApiPropertyOptional()
  userPoints?: number;
  
  static from(league: CreateLeagueResponse): LeagueResponseDto {
    return {
      id: league.id,
      name: league.name,
      code: league.code,
      description: league.description,
      memberCount: 1, // Owner is the first member
      maxMembers: league.maxMembers,
      isPrivate: league.isPrivate,
    };
  }
  
  static fromUserLeague(league: UserLeagueItem): LeagueResponseDto {
    return {
      id: league.id,
      name: league.name,
      code: league.code,
      description: league.description,
      memberCount: league.memberCount,
      maxMembers: league.maxMembers,
      isPrivate: false, // This should come from the league entity
      isOwner: league.isOwner,
      userRole: league.userRole,
      userPosition: league.userPosition,
      userPoints: league.userPoints,
    };
  }
}