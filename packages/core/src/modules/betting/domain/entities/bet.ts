import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { BetId } from '../value-objects/bet-id';
import { BetAmount } from '../value-objects/bet-amount';
import { BetStatus, BetStatusVO } from '../value-objects/bet-status';
import { Odds } from '../value-objects/odds';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { BetSelection } from './bet-selection';
import { MatchResult } from '../../../matches/domain/entities/match-result';

export interface BetProps {
  id: BetId;
  userId: UserId;
  selections: BetSelection[];
  amount: BetAmount;
  status?: BetStatusVO;
  settledAt?: DateTime;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class Bet extends BaseEntity<BetId> {
  private readonly _userId: UserId;
  private readonly _selections: BetSelection[];
  private readonly _amount: BetAmount;
  private readonly _totalOdds: Odds;
  private readonly _potentialWin: number;
  private _status: BetStatusVO;
  private _settledAt?: DateTime;
  
  constructor(props: BetProps) {
    super(props.id, props.createdAt, props.updatedAt);
    
    this.validateSelections(props.selections);
    
    this._userId = props.userId;
    this._selections = props.selections;
    this._amount = props.amount;
    this._totalOdds = this.calculateTotalOdds();
    this._potentialWin = this._amount.calculatePotentialWin(this._totalOdds.value);
    this._status = props.status || new BetStatusVO(BetStatus.PENDING);
    this._settledAt = props.settledAt;
  }
  
  private validateSelections(selections: BetSelection[]): void {
    if (selections.length === 0) {
      throw new Error('A bet must have at least one selection');
    }
    
    if (selections.length > 10) {
      throw new Error('A bet cannot have more than 10 selections');
    }
    
    // Check for conflicting markets in the same match
    const matchIds = new Set<string>();
    for (const selection of selections) {
      const matchKey = selection.matchId.value;
      if (matchIds.has(matchKey)) {
        throw new Error('Cannot bet on multiple markets in the same match');
      }
      matchIds.add(matchKey);
    }
  }
  
  private calculateTotalOdds(): Odds {
    return this._selections.reduce(
      (total, selection) => total.multiply(selection.odds),
      new Odds(1)
    );
  }
  
  get userId(): UserId {
    return this._userId;
  }
  
  get selections(): readonly BetSelection[] {
    return [...this._selections];
  }
  
  get amount(): BetAmount {
    return this._amount;
  }
  
  get totalOdds(): Odds {
    return this._totalOdds;
  }
  
  get potentialWin(): number {
    return this._potentialWin;
  }
  
  get status(): BetStatusVO {
    return this._status;
  }
  
  get settledAt(): DateTime | undefined {
    return this._settledAt;
  }
  
  settle(results: Map<string, MatchResult>): void {
    if (!this._status.isPending()) {
      throw new Error('Can only settle pending bets');
    }
    
    // Check if all matches are finished
    for (const selection of this._selections) {
      const result = results.get(selection.matchId.value);
      if (!result) {
        throw new Error(`Match ${selection.matchId.value} result not available`);
      }
    }
    
    // Check if all selections are winning
    let allCorrect = true;
    for (const selection of this._selections) {
      const result = results.get(selection.matchId.value)!;
      if (!selection.isWinning(result)) {
        allCorrect = false;
        break;
      }
    }
    
    this._status = new BetStatusVO(allCorrect ? BetStatus.WON : BetStatus.LOST);
    this._settledAt = DateTime.now();
    this.updateTimestamp();
  }
  
  cancel(): void {
    if (!this._status.isPending()) {
      throw new Error('Can only cancel pending bets');
    }
    
    this._status = new BetStatusVO(BetStatus.CANCELLED);
    this._settledAt = DateTime.now();
    this.updateTimestamp();
  }
}