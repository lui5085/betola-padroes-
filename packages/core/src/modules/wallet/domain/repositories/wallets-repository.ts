import { Wallet } from '../entities/wallet';
import { WalletId } from '../value-objects/wallet-id';
import { UserId } from '../../../auth/domain/value-objects/user-id';

export interface WalletsRepository {
  save(wallet: Wallet): Promise<void>;
  findById(id: WalletId): Promise<Wallet | null>;
  findByUserId(userId: UserId): Promise<Wallet | null>;
  update(wallet: Wallet): Promise<void>;
}