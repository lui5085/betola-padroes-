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
      id: bet.id?.value || bet.id,
      userId: bet.userId?.value || bet.userId,
      type: bet.type || 'SINGLE',
      amount: bet.amount?.value || bet.amount,
      potentialReturn: bet.potentialReturn || bet.potentialWin,
      status: bet.status?.value || bet.status,
      selections: bet.selections.map((sel: any) => ({
        matchId: sel.matchId?.value || sel.matchId,
        marketId: sel.marketId?.value || sel.marketId,
        marketType: sel.marketType?.value || sel.marketType,
        marketName: sel.marketName || this.getMarketName(sel.marketType?.value || sel.marketType),
        optionName: sel.selection || sel.optionName,
        odds: sel.odds?.value || sel.odds,
        status: sel.status || 'PENDING',
        homeTeam: sel.match?.homeTeam?.name || sel.homeTeam || '',
        awayTeam: sel.match?.awayTeam?.name || sel.awayTeam || '',
        kickoffTime: sel.match?.kickoffTime || sel.kickoffTime || '',
        matchStatus: sel.match?.status || sel.matchStatus || 'SCHEDULED',
        homeScore: sel.match?.homeScore || sel.homeScore,
        awayScore: sel.match?.awayScore || sel.awayScore
      })),
      totalOdds: bet.totalOdds?.value || bet.totalOdds,
      createdAt: bet.createdAt?.value || bet.createdAt,
      settledAt: bet.settledAt?.value || bet.settledAt,
      wonAmount: bet.wonAmount
    };
  }

  private static getMarketName(marketType: string): string {
    const types: Record<string, string> = {
      'MATCH_WINNER': 'Resultado Final',
      'BOTH_TEAMS_SCORE': 'Ambas Marcam',
      'OVER_UNDER_GOALS': 'Total de Gols',
      'DOUBLE_CHANCE': 'Dupla Chance',
      'CORRECT_SCORE': 'Placar Correto',
      'FIRST_HALF_RESULT': 'Resultado 1º Tempo',
      'ODD_EVEN_GOALS': 'Par/Ímpar',
      'ASIAN_HANDICAP': 'Handicap Asiático'
    };
    return types[marketType] || marketType;
  }
}