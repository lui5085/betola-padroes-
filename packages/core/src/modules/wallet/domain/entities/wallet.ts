import { BaseEntity } from '../../../../shared/domain/entities/base-entity';
import { WalletId } from '../value-objects/wallet-id';
import { Balance } from '../value-objects/balance';
import { UserId } from '../../../auth/domain/value-objects/user-id';
import { Money } from '../../../../shared/domain/value-objects/money';
import { DateTime } from '../../../../shared/domain/value-objects/date-time';

export interface WalletProps {
  id: WalletId;
  userId: UserId;
  balance: Balance;
  totalWon: Money;
  totalLost: Money;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export class Wallet extends BaseEntity<WalletId> {
  private readonly _userId: UserId;
  private _balance: Balance;
  private _totalWon: Money;
  private _totalLost: Money;
  
  constructor(props: WalletProps) {
    super(props.id, props.createdAt, props.updatedAt);
    
    this._userId = props.userId;
    this._balance = props.balance;
    this._totalWon = props.totalWon;
    this._totalLost = props.totalLost;
  }
  
  static create(userId: UserId): Wallet {
    return new Wallet({
      id: WalletId.create(),
      userId,
      balance: Balance.initial(),
      totalWon: new Money(0),
      totalLost: new Money(0)
    });
  }
  
  get userId(): UserId {
    return this._userId;
  }
  
  get balance(): Balance {
    return this._balance;
  }
  
  get totalWon(): Money {
    return this._totalWon;
  }
  
  get totalLost(): Money {
    return this._totalLost;
  }
  
  get netProfit(): Money {
    return this._totalWon.subtract(this._totalLost);
  }
  
  deductBetAmount(amount: Money): void {
    if (!this._balance.canAfford(amount)) {
      throw new Error('Insufficient balance for bet');
    }
    
    this._balance = this._balance.deduct(amount);
    this._totalLost = this._totalLost.add(amount);
    this.updateTimestamp();
  }
  
  creditWinnings(amount: Money): void {
    this._balance = this._balance.credit(amount);
    this._totalWon = this._totalWon.add(amount);
    this.updateTimestamp();
  }
  
  refundBet(amount: Money): void {
    this._balance = this._balance.credit(amount);
    this._totalLost = this._totalLost.subtract(amount);
    this.updateTimestamp();
  }
  
  addBonus(amount: Money): void {
    this._balance = this._balance.credit(amount);
    this.updateTimestamp();
  }
}