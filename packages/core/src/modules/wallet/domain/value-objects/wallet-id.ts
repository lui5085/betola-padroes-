import { ID } from '../../../../shared/domain/value-objects/id';
import { randomUUID } from 'crypto';

export class WalletId extends ID<WalletId> {
  static create(): WalletId {
    return new WalletId(randomUUID());
  }
  
  static fromString(value: string): WalletId {
    return new WalletId(value);
  }
}