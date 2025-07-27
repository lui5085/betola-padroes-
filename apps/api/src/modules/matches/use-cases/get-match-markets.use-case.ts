import { Injectable } from '@nestjs/common';

export interface GetMatchMarketsRequest {
  matchId: string;
}

@Injectable()
export class GetMatchMarketsUseCase {
  async execute(request: GetMatchMarketsRequest): Promise<{ value: any[] }> {
    // Mock implementation - replace with actual markets repository
    const mockMarkets = [
      {
        id: '1',
        type: 'MATCH_WINNER',
        name: 'Resultado Final',
        options: [
          { name: 'Home', odds: 2.10 },
          { name: 'Draw', odds: 3.20 },
          { name: 'Away', odds: 3.50 }
        ],
        isActive: true
      },
      {
        id: '2',
        type: 'BOTH_TEAMS_SCORE',
        name: 'Ambos Marcam',
        options: [
          { name: 'Yes', odds: 1.80 },
          { name: 'No', odds: 1.95 }
        ],
        isActive: true
      }
    ];
    
    return {
      value: mockMarkets
    };
  }
}