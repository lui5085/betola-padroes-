import { Module } from '@nestjs/common';
import { LeaguesController } from './controllers/leagues.controller';
import { 
  CreateLeagueUseCase, 
  JoinLeagueUseCase, 
  GetLeagueRankingUseCase, 
  GetUserLeaguesUseCase,
  GetLeagueDetailsUseCase,
  LeaveLeagueUseCase,
  UpdateMemberStatsUseCase,
  UpdateLeagueUseCase,
  InviteUserByUsernameUseCase,
  LeaguesRepository,
  LeagueInvitesRepository
} from '@betola/core';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { 
  PrismaLeaguesRepository,
  PrismaLeagueInvitesRepository
} from '@betola/adapters';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [LeaguesController],
  providers: [
    PrismaService,
    // Repositories
    {
      provide: 'LeaguesRepository',
      useFactory: (prisma: PrismaService) => new PrismaLeaguesRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'LeagueInvitesRepository',
      useFactory: (prisma: PrismaService) => new PrismaLeagueInvitesRepository(prisma),
      inject: [PrismaService],
    },
    // Use cases
    {
      provide: CreateLeagueUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new CreateLeagueUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: JoinLeagueUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new JoinLeagueUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: GetLeagueRankingUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new GetLeagueRankingUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: GetUserLeaguesUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new GetUserLeaguesUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: GetLeagueDetailsUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new GetLeagueDetailsUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: LeaveLeagueUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new LeaveLeagueUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: UpdateMemberStatsUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new UpdateMemberStatsUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: UpdateLeagueUseCase,
      useFactory: (leaguesRepository: LeaguesRepository) => new UpdateLeagueUseCase(leaguesRepository),
      inject: ['LeaguesRepository'],
    },
    {
      provide: InviteUserByUsernameUseCase,
      useFactory: (leaguesRepository: LeaguesRepository, invitesRepository: LeagueInvitesRepository) => 
        new InviteUserByUsernameUseCase(leaguesRepository, invitesRepository),
      inject: ['LeaguesRepository', 'LeagueInvitesRepository'],
    },
  ],
  exports: [
    CreateLeagueUseCase,
    JoinLeagueUseCase,
    GetLeagueRankingUseCase,
    GetUserLeaguesUseCase,
    GetLeagueDetailsUseCase,
    LeaveLeagueUseCase,
    UpdateMemberStatsUseCase,
    UpdateLeagueUseCase,
    InviteUserByUsernameUseCase,
  ],
})
export class LeaguesModule {}