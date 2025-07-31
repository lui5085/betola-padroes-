import { PrismaClient } from '@prisma/client';
import { MarketsRepository } from '@betola/core/modules/betting/domain/repositories/markets-repository';
import { Market, MarketOption } from '@betola/core/modules/betting/domain/entities/market';
import { MarketId } from '@betola/core/modules/betting/domain/value-objects/market-id';
import { MatchId } from '@betola/core/modules/matches/domain/value-objects/match-id';
import { MarketType } from '@betola/core/modules/betting/domain/value-objects/market-type';
import { Odds } from '@betola/core/modules/betting/domain/value-objects/odds';
import { DateTime } from '@betola/core/shared/domain/value-objects/date-time';

export class PrismaMarketsRepository implements MarketsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(market: Market): Promise<void> {
    const optionsData = JSON.stringify(market.options.map(opt => ({
      name: opt.name,
      odds: opt.odds.value,
      isSuspended: opt.isSuspended || false
    })));

    await this.prisma.market.upsert({
      where: { id: market.id.value },
      create: {
        id: market.id.value,
        matchId: market.matchId.value,
        type: market.type,
        name: market.name,
        options: optionsData,
        isActive: market.isActive,
        externalId: market.externalId,
        createdAt: market.createdAt?.value,
        updatedAt: market.updatedAt?.value
      },
      update: {
        type: market.type,
        name: market.name,
        options: optionsData,
        isActive: market.isActive,
        externalId: market.externalId,
        updatedAt: market.updatedAt?.value
      }
    });
  }

  async findById(id: MarketId): Promise<Market | null> {
    const market = await this.prisma.market.findUnique({
      where: { id: id.value }
    });

    return market ? this.toDomain(market) : null;
  }

  async findByMatch(matchId: MatchId): Promise<Market[]> {
    const markets = await this.prisma.market.findMany({
      where: { matchId: matchId.value },
      orderBy: { type: 'asc' }
    });

    return markets.map(market => this.toDomain(market));
  }

  async findByMatchAndType(matchId: MatchId, type: MarketType): Promise<Market | null> {
    const market = await this.prisma.market.findFirst({
      where: {
        matchId: matchId.value,
        type: type
      }
    });

    return market ? this.toDomain(market) : null;
  }

  async findActiveByMatch(matchId: MatchId): Promise<Market[]> {
    const markets = await this.prisma.market.findMany({
      where: {
        matchId: matchId.value,
        isActive: true
      },
      orderBy: { type: 'asc' }
    });

    return markets.map(market => this.toDomain(market));
  }

  async findActiveMarketsForMatch(matchId: MatchId): Promise<Market[]> {
    return this.findActiveByMatch(matchId);
  }

  async update(market: Market): Promise<void> {
    await this.prisma.market.update({
      where: { id: market.id.value },
      data: {
        options: JSON.stringify(market.options.map(opt => ({
          name: opt.name,
          odds: opt.odds.value,
          isSuspended: opt.isSuspended || false
        }))),
        isActive: market.isActive,
        updatedAt: market.updatedAt?.value
      }
    });
  }

  async deactivateByMatch(matchId: MatchId): Promise<void> {
    await this.prisma.market.updateMany({
      where: { matchId: matchId.value },
      data: { isActive: false }
    });
  }

  async delete(id: MarketId): Promise<void> {
    await this.prisma.market.delete({
      where: { id: id.value }
    });
  }

  private toDomain(data: any): Market {
    const options: MarketOption[] = JSON.parse(data.options).map((opt: any) => ({
      name: opt.name,
      odds: new Odds(opt.odds),
      isSuspended: opt.isSuspended || false
    }));

    return new Market({
      id: new MarketId(data.id),
      matchId: new MatchId(data.matchId),
      type: data.type as MarketType,
      name: data.name,
      options,
      isActive: data.isActive,
      externalId: data.externalId,
      createdAt: data.createdAt ? new DateTime(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new DateTime(data.updatedAt) : undefined
    });
  }
}