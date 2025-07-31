// apps/api/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommandRunnerModule } from 'nest-commander';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { PrismaService } from './infrastructure/database/prisma.service';
import { BettingModule } from './modules/betting/betting.module';
import { MatchesModule } from './modules/matches/matches.module';
import { LeaguesModule } from './modules/leagues/leagues.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { SyncBrasileiraCommand } from './commands/sync-brasileirao.command';

// Use cases for commands
import { SyncBrasileraoDataUseCase } from '@betola/core/modules/matches/application/use-cases/sync-brasileirao-data';
import { SyncTeamsUseCase } from '@betola/core/modules/matches/application/use-cases/sync-teams';
import { SyncMatchOddsUseCase } from './modules/betting/use-cases/sync-match-odds.use-case';

// Repositories for commands
import { PrismaMatchesRepository } from '@betola/adapters/matches/persistence/prisma-matches-repository';
import { PrismaTeamsRepository } from '@betola/adapters/matches/persistence/prisma-teams-repository';
import { PrismaMarketsRepository } from '@betola/adapters/betting/persistence/prisma-markets-repository';

// External services
import { FootballApiClient } from '@betola/adapters/matches/football-api-client';
import { createFootballApiConfig } from './config/football-api.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10,  // 10 requests per minute
    }]),
    CommandRunnerModule,
    AuthModule,
    BettingModule,
    MatchesModule,
    LeaguesModule,
    WalletModule,
    ChatModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    SyncBrasileiraCommand,
    
    // Use cases for commands
    SyncBrasileraoDataUseCase,
    SyncTeamsUseCase,
    SyncMatchOddsUseCase,
    
    // Repositories for commands
    {
      provide: 'MatchesRepository',
      useFactory: (prisma: PrismaService) => new PrismaMatchesRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'TeamsRepository',
      useFactory: (prisma: PrismaService) => new PrismaTeamsRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'MarketsRepository',
      useFactory: (prisma: PrismaService) => new PrismaMarketsRepository(prisma),
      inject: [PrismaService]
    },
    
    // Football API Service
    {
      provide: 'FootballApiService',
      useFactory: () => new FootballApiClient(createFootballApiConfig()),
    }
  ],
})
export class AppModule {}