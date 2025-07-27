import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaWalletsRepository } from '@betola/adapters/wallet/persistence/prisma-wallets-repository';
import { CreateWalletUseCase } from './use-cases/create-wallet.use-case';
import { TransferFundsUseCase } from './use-cases/transfer-funds.use-case';
import { GetWalletBalanceUseCase } from './use-cases/get-wallet-balance.use-case';

@Module({
  controllers: [WalletController],
  providers: [
    PrismaService,
    CreateWalletUseCase,
    TransferFundsUseCase,
    GetWalletBalanceUseCase,
    {
      provide: 'WalletsRepository',
      useFactory: (prisma: PrismaService) => new PrismaWalletsRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'PrismaService',
      useClass: PrismaService
    }
  ],
  exports: ['WalletsRepository']
})
export class WalletModule {}