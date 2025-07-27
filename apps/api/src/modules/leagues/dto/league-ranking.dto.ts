import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GetLeagueRankingResponse, LeagueRankingItem } from '@betola/core';

export class LeagueRankingItemDto {
  @ApiProperty()
  position: number;
  
  @ApiProperty()
  userId: string;
  
  @ApiProperty()
  username: string;
  
  @ApiProperty()
  totalPoints: number;
  
  @ApiProperty()
  wonBets: number;
  
  @ApiProperty()
  lostBets: number;
  
  @ApiProperty()
  totalBets: number;
  
  @ApiProperty()
  winRate: number;
  
  @ApiProperty()
  profitMargin: number;
  
  @ApiPropertyOptional()
  isCurrentUser?: boolean;
}

export class LeagueRankingDto {
  @ApiProperty()
  leagueId: string;
  
  @ApiProperty()
  leagueName: string;
  
  @ApiProperty({ type: [LeagueRankingItemDto] })
  ranking: LeagueRankingItemDto[];
  
  @ApiPropertyOptional()
  currentUserPosition?: number;
  
  static from(response: GetLeagueRankingResponse): LeagueRankingDto {
    return {
      leagueId: response.leagueId,
      leagueName: response.leagueName,
      ranking: response.ranking.map(item => ({
        position: item.position,
        userId: item.userId,
        username: item.username,
        totalPoints: item.totalPoints,
        wonBets: item.wonBets,
        lostBets: item.lostBets,
        totalBets: item.totalBets,
        winRate: item.winRate,
        profitMargin: item.profitMargin,
        isCurrentUser: item.isCurrentUser,
      })),
      currentUserPosition: response.currentUserPosition,
    };
  }
}