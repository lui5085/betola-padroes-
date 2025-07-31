import { Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/application/result';

export interface CalculateBetRequest {
  selections: {
    odds: number;
  }[];
  amount: number;
  type: 'SINGLE' | 'MULTIPLE' | 'SYSTEM';
}

export interface CalculateBetResponse {
  totalOdds: number;
  potentialReturn: number;
  potentialProfit: number;
}

@Injectable()
export class CalculateBetUseCase {
  async execute(request: CalculateBetRequest): Promise<Result<CalculateBetResponse>> {
    try {
      // Validate input
      if (request.amount <= 0) {
        return Result.failure('Bet amount must be greater than 0');
      }

      if (!request.selections || request.selections.length === 0) {
        return Result.failure('At least one selection is required');
      }

      // Validate bet type
      if (request.type === 'SINGLE' && request.selections.length !== 1) {
        return Result.failure('Single bet must have exactly one selection');
      }

      if (request.type === 'MULTIPLE' && request.selections.length < 2) {
        return Result.failure('Multiple bet must have at least two selections');
      }

      // Calculate total odds
      let totalOdds = 1;
      for (const selection of request.selections) {
        if (selection.odds < 1.01) {
          return Result.failure('Odds must be at least 1.01');
        }
        totalOdds *= selection.odds;
      }

      // Calculate potential return
      const potentialReturn = request.amount * totalOdds;
      const potentialProfit = potentialReturn - request.amount;

      return Result.success({
        totalOdds: Math.round(totalOdds * 100) / 100,
        potentialReturn: Math.round(potentialReturn * 100) / 100,
        potentialProfit: Math.round(potentialProfit * 100) / 100
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(`Failed to calculate bet: ${errorMessage}`);
    }
  }
}