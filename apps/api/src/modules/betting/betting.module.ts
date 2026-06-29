import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { BettingController } from './controllers/betting.controller';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaClient } from '@prisma/client';

// Use Cases
import { PlaceBetUseCase } from '@betola/core/modules/betting/application/use-cases/place-bet';
import { GetUserBetsUseCase } from './use-cases/get-user-bets.use-case';
import { CalculateBetUseCase } from '@betola/core/modules/betting/application/use-cases/calculate-bet';
import { SettleBetsUseCase } from '@betola/core/modules/betting/application/use-cases/settle-bets';
import { SyncMatchOddsUseCase } from './use-cases/sync-match-odds.use-case';
import { GetMatchMarketsUseCase } from './use-cases/get-match-markets.use-case';

// Decorators
import { LoggingPlaceBetDecorator } from '@betola/core/modules/betting/application/decorators/logging-place-bet-decorator';
import { DailyLimitPlaceBetDecorator } from '@betola/core/modules/betting/application/decorators/daily-limit-place-bet-decorator';

// Services
import { BettingService } from './services/betting.service';
import { OddsUpdateService } from './services/odds-update.service';
import { BetSettlementService } from './services/bet-settlement.service';

// Repositories
import { PrismaBetsRepository } from '@betola/adapters/betting/persistence/prisma-bets-repository';
import { PrismaMarketsRepository } from '@betola/adapters/betting/persistence/prisma-markets-repository';
import { PrismaMatchesRepository } from '@betola/adapters/matches/persistence/prisma-matches-repository';
import { PrismaWalletsRepository } from '@betola/adapters/wallet/persistence/prisma-wallets-repository';
import { BetsRepository } from '@betola/core/modules/betting/domain/repositories/bets-repository';
import { WalletsRepository } from '@betola/core/modules/wallet/domain/repositories/wallets-repository';
import { MatchesRepository } from '@betola/core/modules/matches/domain/repositories/matches-repository';
import { PlaceBetRequest } from '@betola/core';

// External API
import { FootballApiClient } from '@betola/adapters/matches/football-api-client';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NotificationsModule
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
        baseUrl: configService.get<string>('FLASHSCORE_BASE_URL') || 'https://flashscore4.p.rapidapi.com/api/flashscore/v2',
        apiKey: configService.get<string>('FLASHSCORE_API_KEY') || '',
        cacheTtl: {
          leagues: 86400, // 24 hours
          standings: 3600, // 1 hour
          fixtures: 1800, // 30 minutes
          liveMatches: 60 // 1 minute
        }
      }),
      inject: [ConfigService]
    },
    {
      provide: 'PlaceBetUseCase',
      useFactory: (
        prisma: PrismaService,
        betsRepo: BetsRepository,
        walletsRepo: WalletsRepository,
        matchesRepo: MatchesRepository,
        eventBus: any,
      ) => {
        // Wrapper que executa o caso de uso dentro de uma transação
        const useCase = new PlaceBetUseCase(betsRepo, walletsRepo, matchesRepo, eventBus);
        const transactionalUseCase = {
          execute: (request: PlaceBetRequest) => {
            return prisma.$transaction(async (tx) => {
              const transactionalBetsRepo = new PrismaBetsRepository(tx as PrismaClient);
              const transactionalWalletsRepo = new PrismaWalletsRepository(tx as PrismaClient);
              (useCase as any).betsRepository = transactionalBetsRepo;
              (useCase as any).walletsRepository = transactionalWalletsRepo;
              return useCase.execute(request);
            });
          }
        };

        // Decorator Pattern: envolve o use case transacional com logging e limite diário
        return new DailyLimitPlaceBetDecorator(
          new LoggingPlaceBetDecorator(transactionalUseCase),
          betsRepo,
        );
      },
      inject: [
        PrismaService,
        'BetsRepository',
        'WalletsRepository',
        'MatchesRepository',
        'EventBus',
      ],
    },
  ],
  exports: [
    BettingService,
    'BetsRepository',
    'MarketsRepository'
  ]
})
export class BettingModule {}