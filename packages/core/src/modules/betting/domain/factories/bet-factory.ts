import { Bet, BetProps } from '../entities/bet';
import { SingleBet } from '../entities/single-bet';
import { MultipleBet } from '../entities/multiple-bet';

export class BetFactory {
  static create(props: BetProps): Bet {
    if (props.selections.length === 1) {
      return new SingleBet(props);
    }
    return new MultipleBet(props);
  }
}
