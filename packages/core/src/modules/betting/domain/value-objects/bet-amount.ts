import { Money } from '../../../../shared/domain/value-objects/money';

export class BetAmount extends Money {
  private static readonly MIN_BET = 10; // 10 betoletas
  private static readonly MAX_BET = 10000; // 10,000 betoletas
  
  constructor(value: number) {
    if (value < BetAmount.MIN_BET) {
      throw new Error(`Minimum bet amount is ${BetAmount.MIN_BET} betoletas`);
    }
    
    if (value > BetAmount.MAX_BET) {
      throw new Error(`Maximum bet amount is ${BetAmount.MAX_BET} betoletas`);
    }
    
    super(value);
  }
  
  calculatePotentialWin(totalOdds: number): number {
    return Math.floor(this.value * totalOdds);
  }
}