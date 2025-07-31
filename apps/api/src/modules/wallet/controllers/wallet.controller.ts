// apps/api/src/modules/wallet/controllers/wallet.controller.ts

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GetWalletBalanceUseCase } from '../use-cases/get-wallet-balance.use-case';
import { AddFundsUseCase } from '../use-cases/add-funds.use-case';

class AddFundsDto {
  amount: number;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiTags('wallet')
@ApiBearerAuth()
export class WalletController {
  constructor(
    private readonly getWalletBalanceUseCase: GetWalletBalanceUseCase,
    private readonly addFundsUseCase: AddFundsUseCase
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get user wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved' })
  async getBalance(@CurrentUser() user: any) {
    const result = await this.getWalletBalanceUseCase.execute({
      userId: user.id
    });

    if (!result.isSuccess) {
      throw new BadRequestException(result.error);
    }

    return result.value;
  }

  @Post('add-funds')
  @ApiOperation({ summary: 'Add funds to wallet (demo only)' })
  @ApiResponse({ status: 200, description: 'Funds added successfully' })
  async addFunds(
    @CurrentUser() user: any,
    @Body() dto: AddFundsDto
  ) {
    // In a real application, this would integrate with a payment processor
    const result = await this.addFundsUseCase.execute({
      userId: user.id,
      amount: dto.amount
    });

    if (!result.isSuccess) {
      throw new BadRequestException(result.error);
    }

    return result.value;
  }
}