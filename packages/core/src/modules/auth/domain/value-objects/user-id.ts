import { ID } from '../../../../shared/domain/value-objects/id';
import { randomUUID } from 'crypto';

export class UserId extends ID<UserId> {
  static create(): UserId {
    return new UserId(randomUUID());
  }
  
  static fromString(value: string): UserId {
    return new UserId(value);
  }
}