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

export abstract class Bet extends BaseEntity<BetId> {
  abstract get type(): 'SINGLE' | 'MULTIPLE';
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
    
    // Check for conflicting selections (multiple selections in the same market of the same match)
    const marketKeys = new Set<string>();
    for (const selection of selections) {
      const marketKey = `${selection.matchId.value}-${selection.marketType.value}`;
      if (marketKeys.has(marketKey)) {
        throw new Error('Cannot bet on multiple options in the same market');
      }
      marketKeys.add(marketKey);
    }
  }
  
  private calculateTotalOdds(): Odds {
    if (this._selections.length === 0) {
      return new Odds(1.01); // Minimum valid odds for empty case
    }
    
    if (this._selections.length === 1) {
      return this._selections[0].odds;
    }
    
    // For multiple selections, multiply all odds together
    return this._selections.slice(1).reduce(
      (total, selection) => total.multiply(selection.odds),
      this._selections[0].odds
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
  
  evaluate(settledMatchId: string, result: MatchResult): boolean {
    // Para apostas múltiplas, todas as seleções precisam ser resolvidas.
    // Esta lógica simplificada assume que a liquidação acontece
    // apenas quando a última partida da aposta múltipla termina.
    let isWon = true;
    for (const selection of this._selections) {
      if (selection.matchId.value === settledMatchId) {
        if (!selection.isWinning(result)) {
          isWon = false;
          break;
        }
      }
    }
    return isWon;
  }

  settle(isWon: boolean): void {
    this._status = new BetStatusVO(isWon ? BetStatus.WON : BetStatus.LOST);
    this._settledAt = new DateTime(new Date());
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