import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { BetId } from '../value-objects/bet-id';
import { Odds } from '../value-objects/odds';
import { MarketType, MarketTypeVO } from '../value-objects/market-type';
import { MatchId } from '../../../matches/domain/value-objects/match-id';
import { MatchResult } from '../../../matches/domain/entities/match-result';

export interface BetSelectionProps {
  betId: BetId;
  matchId: MatchId;
  marketType: MarketTypeVO;
  selection: string;
  odds: Odds;
}

export class BetSelection extends BaseEntity<BetId> {
  private readonly _betId: BetId;
  private readonly _matchId: MatchId;
  private readonly _marketType: MarketTypeVO;
  private readonly _selection: string;
  private readonly _odds: Odds;
  
  constructor(props: BetSelectionProps) {
    super(props.betId);
    
    if (!props.selection || props.selection.trim().length === 0) {
      throw new Error('Selection cannot be empty');
    }
    
    this._betId = props.betId;
    this._matchId = props.matchId;
    this._marketType = props.marketType;
    this._selection = props.selection.trim();
    this._odds = props.odds;
  }
  
  get betId(): BetId {
    return this._betId;
  }
  
  get matchId(): MatchId {
    return this._matchId;
  }
  
  get marketType(): MarketTypeVO {
    return this._marketType;
  }
  
  get selection(): string {
    return this._selection;
  }
  
  get odds(): Odds {
    return this._odds;
  }
  
  isWinning(matchResult: MatchResult): boolean {
    switch (this._marketType.value) {
      case MarketType.MATCH_WINNER:
        return this.checkMatchWinner(matchResult);
      case MarketType.BOTH_TEAMS_SCORE:
        return this.checkBothTeamsScore(matchResult);
      case MarketType.OVER_UNDER_GOALS:
        return this.checkOverUnder(matchResult);
      default:
        throw new Error(`Market type ${this._marketType.value} not implemented`);
    }
  }
  
  private checkMatchWinner(result: MatchResult): boolean {
    if (this._selection === 'Home') {
      return result.homeScore > result.awayScore;
    }
    if (this._selection === 'Draw') {
      return result.homeScore === result.awayScore;
    }
    if (this._selection === 'Away') {
      return result.awayScore > result.homeScore;
    }
    return false;
  }
  
  private checkBothTeamsScore(result: MatchResult): boolean {
    const bothScored = result.homeScore > 0 && result.awayScore > 0;
    return this._selection === 'Yes' ? bothScored : !bothScored;
  }
  
  private checkOverUnder(result: MatchResult): boolean {
    const totalGoals = result.homeScore + result.awayScore;
    const threshold = parseFloat(this._selection.split(' ')[1]);
    
    if (this._selection.startsWith('Over')) {
      return totalGoals > threshold;
    }
    if (this._selection.startsWith('Under')) {
      return totalGoals < threshold;
    }
    return false;
  }
}