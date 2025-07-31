import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface GetMatchMarketsRequest {
  matchId: string;
}

@Injectable()
export class GetMatchMarketsUseCase {
  constructor(
    private readonly prisma: PrismaService
  ) {}
  
  async execute(request: GetMatchMarketsRequest): Promise<{ value: any[] }> {
    const markets = await this.prisma.market.findMany({
      where: {
        matchId: request.matchId,
        isActive: true
      }
    });
    
    return {
      value: markets.map((market: any) => ({
        id: market.id,
        type: market.type,
        name: market.name,
        options: JSON.parse(market.options),
        isActive: market.isActive
      }))
    };
  }
}