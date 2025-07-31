// apps/api/src/modules/wallet/use-cases/add-funds.use-case.ts

import { Injectable, Inject } from '@nestjs/common';
import { Result } from '@betola/core/shared/application/result';
import { WalletsRepository } from '@betola/core/modules/wallet/domain/repositories/wallets-repository';
import { UserId } from '@betola/core/modules/auth/domain/value-objects/user-id';
import { Money } from '@betola/core/shared/domain/value-objects/money';

export interface AddFundsRequest {
  userId: string;
  amount: number;
}

export interface AddFundsResponse {
  balance: number;
  addedAmount: number;
}

@Injectable()
export class AddFundsUseCase {
  constructor(
    @Inject('WalletsRepository')
    private readonly walletsRepository: WalletsRepository
  ) {}

  async execute(request: AddFundsRequest): Promise<Result<AddFundsResponse>> {
    try {
      // Validate amount
      if (request.amount <= 0) {
        return Result.failure('Amount must be greater than 0');
      }
      
      if (request.amount > 10000) {
        return Result.failure('Maximum deposit amount is 10,000 betoletas');
      }
      
      const userId = UserId.fromString(request.userId);
      const wallet = await this.walletsRepository.findByUserId(userId);
      
      if (!wallet) {
        return Result.failure('Wallet not found');
      }
      
      // Add funds
      const amountToAdd = new Money(request.amount);
      wallet.addBonus(amountToAdd);
      
      // Save updated wallet
      await this.walletsRepository.update(wallet);
      
      return Result.success({
        balance: wallet.balance.value,
        addedAmount: request.amount
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to add funds: ${errorMessage}`);
    }
  }
}