import { Module } from '@nestjs/common';
import { LeaguesController } from './controllers/leagues.controller';
import { CreateLeagueUseCase, JoinLeagueUseCase, GetLeagueRankingUseCase, GetUserLeaguesUseCase } from '@betola/core';
import { PrismaService } from '../../infrastructure/database/prisma.service';

// Mock repository for now
class MockLeaguesRepository {
  async save() {}
  async findById() { return null; }
  async findByCode() { return null; }
  async findByUserId() { return []; }
  async findByFilters() { return []; }
  async update() {}
}

@Module({
  controllers: [LeaguesController],
  providers: [
    PrismaService,
    // Use cases
    CreateLeagueUseCase,
    JoinLeagueUseCase,
    GetLeagueRankingUseCase,
    GetUserLeaguesUseCase,
    // Mock repositories for now
    {
      provide: 'LeaguesRepository',
      useClass: MockLeaguesRepository,
    },
  ],
  exports: [
    CreateLeagueUseCase,
    JoinLeagueUseCase,
    GetLeagueRankingUseCase,
    GetUserLeaguesUseCase,
  ],
})
export class LeaguesModule {}