import { Injectable, Inject } from '@nestjs/common';

export interface GetMatchMarketsRequest {
  matchId: string;
}

@Injectable()
export class GetMatchMarketsUseCase {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: any
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