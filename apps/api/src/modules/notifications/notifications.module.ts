import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsHelper } from './notifications.helper';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsHelper, PrismaService],
  exports: [NotificationsService, NotificationsHelper],
})
export class NotificationsModule {}