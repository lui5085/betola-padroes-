import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BetsRepository, WalletsRepository, MatchResult } from '@betola/core';
import { Money } from '@betola/core/shared/domain/value-objects/money';
import { NotificationsHelper } from '../../notifications/notifications.helper';

@Injectable()
export class BetSettlementService {
  private readonly logger = new Logger(BetSettlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('BetsRepository') private readonly betsRepository: BetsRepository,
    @Inject('WalletsRepository') private readonly walletsRepository: WalletsRepository,
    private readonly notificationsHelper: NotificationsHelper,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.log('Running Bet Settlement Job...');
    
    const matchesToSettle = await this.prisma.match.findMany({
      where: { status: 'FINISHED', betSelections: { some: { bet: { status: 'PENDING' } } } },
      include: { betSelections: { include: { bet: true } } },
    });

    for (const match of matchesToSettle) {
      const matchResult = new MatchResult(match.homeScore, match.awayScore);
      const pendingBets = await this.betsRepository.findPendingByMatchId(match.id);

      for (const bet of pendingBets) {
        const isWon = bet.evaluate(match.id, matchResult);
        bet.settle(isWon);
        
        if (isWon) {
          const wallet = await this.walletsRepository.findByUserId(bet.userId);
          if (wallet) {
            wallet.credit(new Money(bet.potentialWin));
            await this.walletsRepository.update(wallet);
          }
        }
        await this.betsRepository.update(bet);

        // Send notification to user about bet settlement
        try {
          await this.notificationsHelper.notifyBetSettled({
            userId: bet.userId.value,
            betId: bet.id.value,
            status: isWon ? 'WON' : 'LOST',
            amount: bet.amount.value,
            payout: isWon ? bet.potentialWin : undefined,
          });
        } catch (error) {
          this.logger.error(`Failed to send bet settlement notification for bet ${bet.id.value}:`, error);
        }
      }
    }
    this.logger.log('Bet Settlement Job finished.');
  }
}