import { ApiProperty } from '@nestjs/swagger';

export class BetSelectionResponseDto {
  @ApiProperty()
  matchId: string;

  @ApiProperty()
  marketId: string;

  @ApiProperty()
  marketType: string;

  @ApiProperty()
  marketName: string;

  @ApiProperty()
  optionName: string;

  @ApiProperty()
  odds: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  homeTeam: string;

  @ApiProperty()
  awayTeam: string;

  @ApiProperty()
  kickoffTime: string;

  @ApiProperty()
  matchStatus: string;

  @ApiProperty({ required: false })
  homeScore?: number;

  @ApiProperty({ required: false })
  awayScore?: number;
}

export class BetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  potentialReturn: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [BetSelectionResponseDto] })
  selections: BetSelectionResponseDto[];

  @ApiProperty()
  totalOdds: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ required: false })
  settledAt?: string;

  @ApiProperty({ required: false })
  wonAmount?: number;

  static from(bet: any): BetResponseDto {
    return {
      id: bet.id,
      userId: bet.userId,
      type: bet.type,
      amount: bet.amount,
      potentialReturn: bet.potentialReturn,
      status: bet.status,
      selections: bet.selections.map((sel: any) => ({
        matchId: sel.matchId,
        marketId: sel.marketId,
        marketType: sel.marketType,
        marketName: sel.marketName,
        optionName: sel.optionName,
        odds: sel.odds,
        status: sel.status,
        homeTeam: sel.homeTeam,
        awayTeam: sel.awayTeam,
        kickoffTime: sel.kickoffTime,
        matchStatus: sel.matchStatus,
        homeScore: sel.homeScore,
        awayScore: sel.awayScore
      })),
      totalOdds: bet.totalOdds,
      createdAt: bet.createdAt,
      settledAt: bet.settledAt,
      wonAmount: bet.wonAmount
    };
  }
}