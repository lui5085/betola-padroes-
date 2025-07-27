import { Result } from '../../../../shared/application/result';
import { FootballApiService } from '../../domain/services/football-api-service';
import { MatchesRepository } from '../../domain/repositories/matches-repository';
import { MarketsRepository } from '../../../betting/domain/repositories/markets-repository';
import { Market } from '../../../betting/domain/entities/market';
import { MarketId } from '../../../betting/domain/value-objects/market-id';
import { MatchId } from '../../domain/value-objects/match-id';
import { MarketType } from '../../../betting/domain/value-objects/market-type';
import { Odds } from '../../../betting/domain/value-objects/odds';

export interface SyncMatchOddsRequest {
  matchId?: string;
  externalMatchId?: string;
  forceRefresh?: boolean;
}

export interface SyncMatchOddsResponse {
  marketsCreated: number;
  marketsUpdated: number;
  errors: string[];
}

export class SyncMatchOddsUseCase {
  constructor(
    private readonly footballApiService: FootballApiService,
    private readonly matchesRepository: MatchesRepository,
    private readonly marketsRepository: MarketsRepository
  ) {}

  async execute(request: SyncMatchOddsRequest = {}): Promise<Result<SyncMatchOddsResponse>> {
    try {
      let marketsCreated = 0;
      let marketsUpdated = 0;
      const errors: string[] = [];

      if (request.matchId) {
        // Sync odds for specific match
        const match = await this.matchesRepository.findById(new MatchId(request.matchId));
        if (!match || !match.externalId) {
          return Result.failure('Match not found or has no external ID');
        }

        const result = await this.syncOddsForMatch(match.id, match.externalId);
        marketsCreated += result.created;
        marketsUpdated += result.updated;
        if (result.error) errors.push(result.error);
      } else {
        // Sync odds for all upcoming matches
        const upcomingMatches = await this.matchesRepository.findAvailableForBetting();
        
        for (const match of upcomingMatches) {
          if (!match.externalId) continue;
          
          try {
            const result = await this.syncOddsForMatch(match.id, match.externalId);
            marketsCreated += result.created;
            marketsUpdated += result.updated;
            if (result.error) errors.push(result.error);
          } catch (error) {
            errors.push(`Failed to sync odds for match ${match.id.value}: ${error.message}`);
          }
        }
      }

      return Result.success({
        marketsCreated,
        marketsUpdated,
        errors
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to sync match odds: ${errorMessage}`);
    }
  }

  private async syncOddsForMatch(
    matchId: MatchId, 
    externalMatchId: string
  ): Promise<{ created: number; updated: number; error?: string }> {
    try {
      const oddsResponse = await this.footballApiService.getOdds(parseInt(externalMatchId));
      
      if (!oddsResponse.response.length) {
        return { created: 0, updated: 0, error: `No odds found for match ${externalMatchId}` };
      }

      let created = 0;
      let updated = 0;

      const oddsData = oddsResponse.response[0];
      const bookmaker = oddsData.bookmakers.find(b => b.id === 8); // Bet365
      
      if (!bookmaker) {
        return { created: 0, updated: 0, error: 'No Bet365 odds found' };
      }

      // Process each bet type
      for (const bet of bookmaker.bets) {
        const marketType = this.mapBetNameToMarketType(bet.name);
        if (!marketType) continue;

        const existingMarket = await this.marketsRepository.findByMatchAndType(matchId, marketType);
        
        if (existingMarket) {
          // Update existing market
          const updated = this.updateMarketOdds(existingMarket, bet.values);
          if (updated) {
            await this.marketsRepository.save(existingMarket);
            updated++;
          }
        } else {
          // Create new market
          const newMarket = this.createMarketFromBet(matchId, bet, marketType);
          await this.marketsRepository.save(newMarket);
          created++;
        }
      }

      return { created, updated };
    } catch (error) {
      return { 
        created: 0, 
        updated: 0, 
        error: `Failed to fetch odds: ${error.message}` 
      };
    }
  }

  private mapBetNameToMarketType(betName: string): MarketType | null {
    const mappings: Record<string, MarketType> = {
      'Match Winner': MarketType.MATCH_WINNER,
      'Both Teams Score': MarketType.BOTH_TEAMS_SCORE,
      'Total Goals Over/Under': MarketType.OVER_UNDER_GOALS,
      'Asian Handicap': MarketType.ASIAN_HANDICAP,
      'Correct Score': MarketType.CORRECT_SCORE,
      'First Half Result': MarketType.FIRST_HALF_RESULT,
      'Double Chance': MarketType.DOUBLE_CHANCE
    };

    // Handle variations in bet names
    for (const [key, type] of Object.entries(mappings)) {
      if (betName.toLowerCase().includes(key.toLowerCase())) {
        return type;
      }
    }

    // Special handling for over/under
    if (betName.includes('Goals Over/Under')) {
      return MarketType.OVER_UNDER_GOALS;
    }

    return null;
  }

  private createMarketFromBet(matchId: MatchId, bet: any, marketType: MarketType): Market {
    const options = bet.values.map((value: any) => ({
      name: this.normalizeOptionName(value.value, marketType),
      odds: new Odds(parseFloat(value.odd))
    }));

    return new Market({
      id: MarketId.create(),
      matchId,
      type: marketType,
      name: this.getMarketDisplayName(bet.name, marketType),
      options,
      isActive: true
    });
  }

  private updateMarketOdds(market: Market, values: any[]): boolean {
    let updated = false;

    for (const value of values) {
      const optionName = this.normalizeOptionName(value.value, market.type);
      const newOdds = new Odds(parseFloat(value.odd));
      
      if (market.updateOptionOdds(optionName, newOdds)) {
        updated = true;
      }
    }

    return updated;
  }

  private normalizeOptionName(value: string, marketType: MarketType): string {
    // Normalize option names based on market type
    switch (marketType) {
      case MarketType.MATCH_WINNER:
        if (value === '1' || value.toLowerCase() === 'home') return 'Home';
        if (value === 'X' || value.toLowerCase() === 'draw') return 'Draw';
        if (value === '2' || value.toLowerCase() === 'away') return 'Away';
        break;
      case MarketType.BOTH_TEAMS_SCORE:
        if (value.toLowerCase() === 'yes') return 'Yes';
        if (value.toLowerCase() === 'no') return 'No';
        break;
      case MarketType.OVER_UNDER_GOALS:
        // Extract the line and type (e.g., "Over 2.5" or "Under 2.5")
        const match = value.match(/(Over|Under)\s*([\d.]+)/i);
        if (match) {
          return `${match[1]} ${match[2]}`;
        }
        break;
    }
    
    return value;
  }

  private getMarketDisplayName(betName: string, marketType: MarketType): string {
    const displayNames: Record<MarketType, string> = {
      [MarketType.MATCH_WINNER]: 'Resultado Final',
      [MarketType.BOTH_TEAMS_SCORE]: 'Ambos Marcam',
      [MarketType.OVER_UNDER_GOALS]: this.extractGoalsLine(betName) || 'Total de Gols',
      [MarketType.ASIAN_HANDICAP]: 'Handicap Asiático',
      [MarketType.CORRECT_SCORE]: 'Placar Correto',
      [MarketType.FIRST_HALF_RESULT]: 'Resultado 1º Tempo',
      [MarketType.DOUBLE_CHANCE]: 'Dupla Chance'
    };

    return displayNames[marketType] || betName;
  }

  private extractGoalsLine(betName: string): string | null {
    const match = betName.match(/(\d+\.?\d*)/);
    if (match) {
      return `Acima/Abaixo ${match[1]} Gols`;
    }
    return null;
  }
}