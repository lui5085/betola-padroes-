import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsHelper {
  constructor(private notificationsService: NotificationsService) {}

  async notifyLeagueInvite(data: {
    userId: string;
    leagueName: string;
    inviterName: string;
    leagueId: string;
  }) {
    return this.notificationsService.createNotification({
      userId: data.userId,
      type: 'LEAGUE_INVITE',
      title: 'Novo convite para liga!',
      message: `${data.inviterName} te convidou para entrar na liga "${data.leagueName}"`,
      data: {
        leagueId: data.leagueId,
        leagueName: data.leagueName,
        inviterName: data.inviterName,
      },
    });
  }

  async notifyLeagueJoined(data: {
    userId: string;
    leagueName: string;
    newMemberName: string;
    leagueId: string;
  }) {
    return this.notificationsService.createNotification({
      userId: data.userId,
      type: 'LEAGUE_JOINED',
      title: 'Novo membro na liga!',
      message: `${data.newMemberName} entrou na liga "${data.leagueName}"`,
      data: {
        leagueId: data.leagueId,
        leagueName: data.leagueName,
        newMemberName: data.newMemberName,
      },
    });
  }

  async notifyBetSettled(data: {
    userId: string;
    betId: string;
    status: 'WON' | 'LOST';
    amount: number;
    payout?: number;
  }) {
    const isWin = data.status === 'WON';
    
    return this.notificationsService.createNotification({
      userId: data.userId,
      type: isWin ? 'BET_WON' : 'BET_LOST',
      title: isWin ? '🎉 Aposta ganha!' : '😔 Aposta perdida',
      message: isWin 
        ? `Parabéns! Você ganhou ${data.payout} betoletas!`
        : `Sua aposta de ${data.amount} betoletas não foi bem-sucedida.`,
      data: {
        betId: data.betId,
        status: data.status,
        amount: data.amount,
        payout: data.payout,
      },
    });
  }

  async notifyMultipleUsers(userIds: string[], notificationData: {
    type: 'LEAGUE_INVITE' | 'BET_SETTLED' | 'LEAGUE_JOINED' | 'BET_WON' | 'BET_LOST';
    title: string;
    message: string;
    data?: any;
  }) {
    const promises = userIds.map(userId =>
      this.notificationsService.createNotification({
        userId,
        ...notificationData,
      })
    );

    return Promise.allSettled(promises);
  }
}