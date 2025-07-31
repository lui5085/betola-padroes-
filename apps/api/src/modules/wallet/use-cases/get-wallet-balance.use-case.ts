// apps/api/src/modules/wallet/use-cases/get-wallet-balance.use-case.ts

import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@betola/core/shared/application/result';
import { WalletsRepository } from '@betola/core/modules/wallet/domain/repositories/wallets-repository';
import { UserId } from '@betola/core/modules/auth/domain/value-objects/user-id';
import { Wallet } from '@betola/core/modules/wallet/domain/entities/wallet';

export interface GetWalletBalanceRequest {
  userId: string;
}

export interface GetWalletBalanceResponse {
  balance: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
}

@Injectable()
export class GetWalletBalanceUseCase {
  constructor(
    @Inject('WalletsRepository')
    private readonly walletsRepository: WalletsRepository
  ) {}

  async execute(request: GetWalletBalanceRequest): Promise<Result<GetWalletBalanceResponse>> {
    try {
      const userId = UserId.fromString(request.userId);
      
      let wallet = await this.walletsRepository.findByUserId(userId);
      
      // Create wallet if it doesn't exist (first time user)
      if (!wallet) {
        wallet = Wallet.create(userId);
        await this.walletsRepository.save(wallet);
      }
      
      return Result.success({
        balance: wallet.balance.value,
        totalWon: wallet.totalWon.value,
        totalLost: wallet.totalLost.value,
        netProfit: wallet.netProfit.value
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to get wallet balance: ${errorMessage}`);
    }
  }
}