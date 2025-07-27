import { Injectable, Inject } from '@nestjs/common';
import { BetsRepository, BetFilters, PaginatedBets } from '@betola/core';
import { UserId, BetStatus } from '@betola/core';

export interface GetUserBetsRequest {
  userId: string;
  status?: BetStatus;
  page?: number;
  limit?: number;
  betId?: string;
}

export interface GetUserBetsResponse {
  items: any[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class GetUserBetsUseCase {
  constructor(
    @Inject('BetsRepository')
    private readonly betsRepository: BetsRepository
  ) {}
  
  async execute(request: GetUserBetsRequest): Promise<{ value: GetUserBetsResponse }> {
    const userId = UserId.fromString(request.userId);
    
    const filters: BetFilters = {
      userId,
      status: request.status,
      page: request.page || 1,
      limit: request.limit || 20
    };
    
    const result = await this.betsRepository.findByUserId(userId, filters);
    
    return {
      value: {
        items: result.items,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      }
    };
  }
}