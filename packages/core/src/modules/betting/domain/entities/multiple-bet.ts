import { Bet, BetProps } from './bet';

export class MultipleBet extends Bet {
  constructor(props: BetProps) {
    if (props.selections.length < 2) {
      throw new Error('MultipleBet must have at least two selections');
    }
    super(props);
  }

  get type(): 'MULTIPLE' {
    return 'MULTIPLE';
  }
}
