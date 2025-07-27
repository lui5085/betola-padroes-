import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { MarketId } from '../value-objects/market-id';
import { MatchId } from '../../../matches/domain/value-objects/match-id';
import { MarketType } from '../value-objects/market-type';
import { Odds } from '../value-objects/odds';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';

export interface MarketOption {
  name: string;
  odds: Odds;
  isSuspended?: boolean;
}

export interface MarketProps {
  id: MarketId;
  matchId: MatchId;
  type: MarketType;
  name: string;
  options: MarketOption[];
  isActive?: boolean;
  externalId?: string;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class Market extends BaseEntity<MarketId> {
  private readonly _matchId: MatchId;
  private readonly _type: MarketType;
  private readonly _name: string;
  private _options: MarketOption[];
  private _isActive: boolean;
  private readonly _externalId?: string;

  constructor(props: MarketProps) {
    super(props.id, props.createdAt, props.updatedAt);

    if (!props.options || props.options.length === 0) {
      throw new Error('Market must have at least one option');
    }

    this._matchId = props.matchId;
    this._type = props.type;
    this._name = props.name;
    this._options = [...props.options];
    this._isActive = props.isActive ?? true;
    this._externalId = props.externalId;
  }

  get matchId(): MatchId {
    return this._matchId;
  }

  get type(): MarketType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get options(): MarketOption[] {
    return [...this._options];
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get externalId(): string | undefined {
    return this._externalId;
  }

  findOption(name: string): MarketOption | undefined {
    return this._options.find(opt => opt.name === name);
  }

  updateOptionOdds(optionName: string, newOdds: Odds): boolean {
    const option = this._options.find(opt => opt.name === optionName);
    
    if (!option) {
      return false;
    }

    if (!option.odds.equals(newOdds)) {
      option.odds = newOdds;
      this.updateTimestamp();
      return true;
    }

    return false;
  }

  suspendOption(optionName: string): void {
    const option = this._options.find(opt => opt.name === optionName);
    
    if (!option) {
      throw new Error(`Option ${optionName} not found`);
    }

    option.isSuspended = true;
    this.updateTimestamp();
  }

  unsuspendOption(optionName: string): void {
    const option = this._options.find(opt => opt.name === optionName);
    
    if (!option) {
      throw new Error(`Option ${optionName} not found`);
    }

    option.isSuspended = false;
    this.updateTimestamp();
  }

  activate(): void {
    this._isActive = true;
    this.updateTimestamp();
  }

  deactivate(): void {
    this._isActive = false;
    this.updateTimestamp();
  }

  hasOption(name: string): boolean {
    return this._options.some(opt => opt.name === name);
  }

  getActiveOptions(): MarketOption[] {
    return this._options.filter(opt => !opt.isSuspended);
  }

  isAvailable(): boolean {
    return this._isActive && this.getActiveOptions().length > 0;
  }

  // Validate odds for specific market types
  validateOdds(): boolean {
    switch (this._type) {
      case MarketType.MATCH_WINNER:
        // For 1X2 markets, ensure odds are balanced
        const totalProbability = this._options.reduce(
          (sum, opt) => sum + (1 / opt.odds.value), 
          0
        );
        // Should be around 1.0 with overround (typically 1.05-1.15)
        return totalProbability >= 1.0 && totalProbability <= 1.2;
      
      case MarketType.BOTH_TEAMS_SCORE:
        // Binary market should have exactly 2 options
        return this._options.length === 2;
      
      default:
        return true;
    }
  }
}