import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { 
  SyncBrasileraoDataUseCase,
  FootballApiService,
  MatchesRepository
} from '@betola/core';
import { 
  FootballApiClient,
  PrismaMatchesRepository
} from '@betola/adapters';
import { createFootballApiConfig } from '../../config/football-api.config';

@Module({
  imports: [NotificationsModule],
  controllers: [AdminController],
  providers: [
    AdminService, 
    AdminGuard, 
    PrismaService,
    // Football API
    {
      provide: 'FootballApiService',
      useFactory: () => new FootballApiClient(createFootballApiConfig()),
    },
    // Matches Repository
    {
      provide: 'MatchesRepository',
      useFactory: (prisma: PrismaService) => new PrismaMatchesRepository(prisma),
      inject: [PrismaService],
    },
    // Use Case
    {
      provide: SyncBrasileraoDataUseCase,
      useFactory: (footballApiService: FootballApiService, matchesRepository: MatchesRepository) => 
        new SyncBrasileraoDataUseCase(footballApiService, matchesRepository),
      inject: ['FootballApiService', 'MatchesRepository'],
    },
  ],
  exports: [AdminService, AdminGuard],
})
export class AdminModule {}