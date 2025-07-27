import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth.module';
import { MatchesModule } from './modules/matches/matches.module';
import { BettingModule } from './modules/betting/betting.module';
import { LeaguesModule } from './modules/leagues/leagues.module';
import { PrismaService } from './infrastructure/database/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 10, // 10 requisições por minuto globalmente
    }, {
      name: 'auth',
      ttl: 300000, // 5 minutos
      limit: 5, // 5 tentativas de login em 5 minutos
    }]),
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    PassportModule,
    AuthModule,
    MatchesModule,
    BettingModule,
    LeaguesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}