// packages/adapters/src/wallet/persistence/prisma-wallets-repository.ts

import { PrismaClient } from '@prisma/client';
import {
  WalletsRepository,
  Wallet,
  WalletId,
  UserId,
  Balance,
  Money,
  DateTime
} from '@betola/core';

export class PrismaWalletsRepository implements WalletsRepository {
  constructor(private prisma: PrismaClient) {}

  async save(wallet: Wallet): Promise<void> {
    await this.prisma.wallet.create({
      data: {
        id: wallet.id.value,
        userId: wallet.userId.value,
        balance: wallet.balance.value,
        totalWon: wallet.totalWon.value,
        totalLost: wallet.totalLost.value
      }
    });
  }

  async findById(id: WalletId): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: id.value }
    });

    if (!wallet) return null;

    return this.toDomain(wallet);
  }

  async findByUserId(userId: UserId): Promise<Wallet | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: userId.value }
    });

    if (!wallet) return null;

    return this.toDomain(wallet);
  }

  async update(wallet: Wallet): Promise<void> {
    await this.prisma.wallet.update({
      where: { id: wallet.id.value },
      data: {
        balance: wallet.balance.value,
        totalWon: wallet.totalWon.value,
        totalLost: wallet.totalLost.value,
        updatedAt: wallet.updatedAt?.value || new Date()
      }
    });
  }

  private toDomain(wallet: any): Wallet {
    return new Wallet({
      id: new WalletId(wallet.id),
      userId: new UserId(wallet.userId),
      balance: new Balance(wallet.balance),
      totalWon: new Money(wallet.totalWon || 0),
      totalLost: new Money(wallet.totalLost || 0),
      createdAt: wallet.createdAt ? new DateTime(wallet.createdAt) : undefined,
      updatedAt: wallet.updatedAt ? new DateTime(wallet.updatedAt) : undefined
    });
  }
}