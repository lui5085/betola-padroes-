import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    WsJwtGuard,
    PrismaService,
  ],
  exports: [ChatService],
})
export class ChatModule {}