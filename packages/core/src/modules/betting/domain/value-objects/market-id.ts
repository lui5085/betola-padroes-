import { ID } from '../../../../shared/domain/value-objects/id';
import { randomUUID } from 'crypto';

export class MarketId extends ID<MarketId> {
  static create(): MarketId {
    return new MarketId(randomUUID());
  }
  
  static fromString(value: string): MarketId {
    return new MarketId(value);
  }
}