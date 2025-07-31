import { ApiProperty } from '@nestjs/swagger';

export class TeamDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  shortName: string;
  
  @ApiProperty()
  logoUrl?: string;
}

export class MarketDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  type: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  options: string; // JSON string
}

export class MatchResponseDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  homeTeam: TeamDto;
  
  @ApiProperty()
  awayTeam: TeamDto;
  
  @ApiProperty()
  kickoffTime: string;
  
  @ApiProperty()
  status: string;
  
  @ApiProperty()
  homeScore?: number;
  
  @ApiProperty()
  awayScore?: number;
  
  @ApiProperty()
  round: number;
  
  @ApiProperty()
  season: string;
  
  @ApiProperty({ type: [MarketDto] })
  markets?: MarketDto[];
  
  static from(match: any): MatchResponseDto {
    return {
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      kickoffTime: match.kickoffTime,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      round: match.round,
      season: match.season,
      markets: match.markets || []
    };
  }
}