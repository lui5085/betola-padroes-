import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { BettingController } from './controllers/betting.controller';
import { PrismaService } from '../../infrastructure/database/prisma.service';

// Use Cases
import { PlaceBetUseCase } from '@betola/core/modules/betting/application/use-cases/place-bet';
import { GetUserBetsUseCase } from './use-cases/get-user-bets.use-case';
import { CalculateBetUseCase } from '@betola/core/modules/betting/application/use-cases/calculate-bet';
import { SettleBetsUseCase } from '@betola/core/modules/betting/application/use-cases/settle-bets';
import { SyncMatchOddsUseCase } from './use-cases/sync-match-odds.use-case';
import { GetMatchMarketsUseCase } from './use-cases/get-match-markets.use-case';

// Services
import { BettingService } from './services/betting.service';
import { OddsUpdateService } from './services/odds-update.service';
import { BetSettlementService } from './services/bet-settlement.service';

// Repositories
import { PrismaBetsRepository } from '@betola/adapters/betting/persistence/prisma-bets-repository';
import { PrismaMarketsRepository } from '@betola/adapters/betting/persistence/prisma-markets-repository';
import { PrismaMatchesRepository } from '@betola/adapters/matches/persistence/prisma-matches-repository';
import { PrismaWalletsRepository } from '@betola/adapters/wallet/persistence/prisma-wallets-repository';

// External API
import { FootballApiClient } from '@betola/adapters/matches/football-api-client';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  controllers: [BettingController],
  providers: [
    PrismaService,
    BettingService,
    OddsUpdateService,
    BetSettlementService,
    PlaceBetUseCase,
    GetUserBetsUseCase,
    CalculateBetUseCase,
    SettleBetsUseCase,
    SyncMatchOddsUseCase,
    GetMatchMarketsUseCase,
    
    // Repositories
    {
      provide: 'BetsRepository',
      useFactory: (prisma: PrismaService) => new PrismaBetsRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'MarketsRepository',
      useFactory: (prisma: PrismaService) => new PrismaMarketsRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'MatchesRepository',
      useFactory: (prisma: PrismaService) => new PrismaMatchesRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'WalletsRepository',
      useFactory: (prisma: PrismaService) => new PrismaWalletsRepository(prisma),
      inject: [PrismaService]
    },
    
    // Football API Service
    {
      provide: 'FootballApiService',
      useFactory: (configService: ConfigService) => new FootballApiClient({
        baseUrl: configService.get<string>('FOOTBALL_API_BASE_URL') || 'https://api-football-v1.p.rapidapi.com/v3',
        apiKey: configService.get<string>('FOOTBALL_API_KEY') || '',
        cacheTtl: {
          leagues: 86400, // 24 hours
          standings: 3600, // 1 hour
          fixtures: 1800, // 30 minutes
          liveMatches: 60 // 1 minute
        }
      }),
      inject: [ConfigService]
    }
  ],
  exports: [
    BettingService,
    'BetsRepository',
    'MarketsRepository'
  ]
})
export class BettingModule {}