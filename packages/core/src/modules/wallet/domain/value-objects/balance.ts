import { Money } from '../../../../shared/domain/value-objects/money';

export class Balance extends Money {
  static readonly INITIAL_BALANCE = 1000; // 1000 betoletas iniciais
  
  static initial(): Balance {
    return new Balance(Balance.INITIAL_BALANCE);
  }
  
  canAfford(amount: Money): boolean {
    return this.isGreaterThan(amount) || this.equals(amount);
  }
  
  deduct(amount: Money): Balance {
    if (!this.canAfford(amount)) {
      throw new Error('Insufficient balance');
    }
    return new Balance(this.subtract(amount).value);
  }
  
  credit(amount: Money): Balance {
    return new Balance(this.add(amount).value);
  }
}