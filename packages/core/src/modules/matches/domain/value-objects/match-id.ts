import { ID } from '../../../../shared/domain/value-objects/id';
import { randomUUID } from 'crypto';

export class MatchId extends ID<MatchId> {
  static create(): MatchId {
    return new MatchId(randomUUID());
  }
  
  static fromString(value: string): MatchId {
    return new MatchId(value);
  }
}