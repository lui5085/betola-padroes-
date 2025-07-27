import { ID } from '../../../../shared/domain/value-objects/id';
import { randomUUID } from 'crypto';

export class TeamId extends ID<TeamId> {
  static create(): TeamId {
    return new TeamId(randomUUID());
  }
  
  static fromString(value: string): TeamId {
    return new TeamId(value);
  }
}