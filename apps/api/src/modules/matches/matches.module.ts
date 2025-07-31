import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MatchesController } from './controllers/matches.controller';
import { TeamsController } from './controllers/teams.controller';
import { GetUpcomingMatchesUseCase } from './use-cases/get-upcoming-matches.use-case';
import { GetMatchMarketsUseCase } from './use-cases/get-match-markets.use-case';
import { GetBrasileraoTeamsUseCase } from './use-cases/get-brasileirao-teams.use-case';
import { GetTeamDetailsUseCase } from './use-cases/get-team-details.use-case';
import { GetBrasileraoStandingsUseCase } from './use-cases/get-brasileirao-standings.use-case';
import { ExternalApiService } from './services/external-api-service';
import { MatchSyncService } from './services/match-sync-service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaMatchesRepository } from '@betola/adapters/matches/persistence/prisma-matches-repository';
import { FootballApiClient } from '@betola/adapters/matches/football-api-client';
import { AutoMarketsService } from '../betting/services/auto-markets.service';
import { PrismaMarketsRepository } from '@betola/adapters/betting/persistence/prisma-markets-repository';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot()
  ],
  controllers: [MatchesController, TeamsController],
  providers: [
    PrismaService,
    ExternalApiService,
    MatchSyncService,
    GetUpcomingMatchesUseCase,
    GetMatchMarketsUseCase,
    GetBrasileraoTeamsUseCase,
    GetTeamDetailsUseCase,
    GetBrasileraoStandingsUseCase,
    AutoMarketsService,
    {
      provide: 'MatchesRepository',
      useFactory: (prisma: PrismaService) => new PrismaMatchesRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'MarketsRepository',
      useFactory: (prisma: PrismaService) => new PrismaMarketsRepository(prisma),
      inject: [PrismaService]
    },
    {
      provide: 'FootballApiService',
      useFactory: (configService: ConfigService) => new FootballApiClient({
        baseUrl: configService.get<string>('FOOTBALL_API_BASE_URL') || 'https://api.football-data.org/v4',
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