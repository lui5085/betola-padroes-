import { ID } from '../../../../shared/domain/value-objects/id';
import { randomUUID } from 'crypto';

export class BetId extends ID<BetId> {
  static create(): BetId {
    return new BetId(randomUUID());
  }
  
  static fromString(value: string): BetId {
    return new BetId(value);
  }
}