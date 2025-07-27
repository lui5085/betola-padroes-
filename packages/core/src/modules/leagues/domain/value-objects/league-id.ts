import { ID } from '../../../../shared/domain/value-objects/id';
import { randomUUID } from 'crypto';

export class LeagueId extends ID<LeagueId> {
  static create(): LeagueId {
    return new LeagueId(randomUUID());
  }
  
  static fromString(value: string): LeagueId {
    return new LeagueId(value);
  }
}