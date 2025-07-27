import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MatchesController } from './controllers/matches.controller';
import { GetUpcomingMatchesUseCase } from './use-cases/get-upcoming-matches.use-case';
import { GetMatchMarketsUseCase } from './use-cases/get-match-markets.use-case';
import { ExternalApiService } from './services/external-api-service';
import { MatchSyncService } from './services/match-sync-service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaMatchesRepository } from '@betola/adapters/matches/persistence/prisma-matches-repository';
import { FootballApiClient } from '@betola/adapters/matches/football-api-client';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot()
  ],
  controllers: [MatchesController],
  providers: [
    PrismaService,
    ExternalApiService,
    MatchSyncService,
    GetUpcomingMatchesUseCase,
    GetMatchMarketsUseCase,
    {
      provide: 'MatchesRepository',
      useFactory: (prisma: PrismaService) => new PrismaMatchesRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'FootballApiService',
      useFactory: (configService: ConfigService) => new FootballApiClient({
        baseUrl: configService.get<string>('FOOTBALL_API_URL') || 'https://v3.football.api-sports.io',
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
  exports: [ExternalApiService]
})
export class MatchesModule {}