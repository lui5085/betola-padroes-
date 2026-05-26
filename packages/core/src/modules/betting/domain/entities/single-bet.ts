import { Bet, BetProps } from './bet';

export class SingleBet extends Bet {
  constructor(props: BetProps) {
    if (props.selections.length !== 1) {
      throw new Error('SingleBet must have exactly one selection');
    }
    super(props);
  }

  get type(): 'SINGLE' {
    return 'SINGLE';
  }
}
