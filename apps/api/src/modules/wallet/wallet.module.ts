// apps/api/src/modules/wallet/wallet.module.ts

import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';
import { GetWalletBalanceUseCase } from './use-cases/get-wallet-balance.use-case';
import { AddFundsUseCase } from './use-cases/add-funds.use-case';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaWalletsRepository } from '@betola/adapters/wallet/persistence/prisma-wallets-repository';

@Module({
  controllers: [WalletController],
  providers: [
    PrismaService,
    GetWalletBalanceUseCase,
    AddFundsUseCase,
    {
      provide: 'WalletsRepository',
      useFactory: (prisma: PrismaService) => new PrismaWalletsRepository(prisma),
      inject: [PrismaService]
    }
  ],
  exports: ['WalletsRepository']
})
export class WalletModule {}