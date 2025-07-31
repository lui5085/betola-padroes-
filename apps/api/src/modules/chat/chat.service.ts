import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

interface SaveMessageDto {
  leagueId: string;
  userId: string;
  content: string;
  type?: string;
  metadata?: any;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async isUserMemberOfLeague(userId: string, leagueId: string): Promise<boolean> {
    const membership = await this.prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId,
          userId,
        },
      },
    });

    return !!membership;
  }

  async saveMessage(data: SaveMessageDto) {
    return await this.prisma.leagueMessage.create({
      data: {
        leagueId: data.leagueId,
        userId: data.userId,
        content: data.content,
        type: data.type || 'TEXT',
        metadata: JSON.stringify(data.metadata || {}),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async saveSystemMessage(leagueId: string, content: string, metadata?: any) {
    // For system messages, we'll create them without a real user
    // We can use a special approach or create a system user during setup
    // For now, let's find the league owner as the system message sender
    const league = await this.prisma.league.findUnique({
      where: { id: leagueId },
      select: { ownerId: true },
    });

    if (!league) {
      throw new Error('League not found');
    }

    return await this.prisma.leagueMessage.create({
      data: {
        leagueId,
        userId: league.ownerId, // Use league owner for system messages
        content,
        type: 'SYSTEM',
        metadata: JSON.stringify(metadata || {}),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async getRecentMessages(leagueId: string, limit: number = 50) {
    return await this.prisma.leagueMessage.findMany({
      where: {
        leagueId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    }).then(messages => messages.reverse()); // Reverse to get chronological order
  }

  async getMessageHistory(
    leagueId: string,
    beforeId?: string,
    limit: number = 20
  ) {
    const whereClause: any = { leagueId };
    
    if (beforeId) {
      const beforeMessage = await this.prisma.leagueMessage.findUnique({
        where: { id: beforeId },
      });
      
      if (beforeMessage) {
        whereClause.createdAt = {
          lt: beforeMessage.createdAt,
        };
      }
    }

    return await this.prisma.leagueMessage.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    }).then(messages => messages.reverse());
  }

  async deleteMessage(messageId: string, userId: string) {
    // Only allow user to delete their own messages
    const message = await this.prisma.leagueMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.userId !== userId) {
      throw new Error('Message not found or unauthorized');
    }

    return await this.prisma.leagueMessage.delete({
      where: { id: messageId },
    });
  }

  async getLeagueActiveUsers(leagueId: string) {
    // Get users who sent messages in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const activeUsers = await this.prisma.leagueMessage.findMany({
      where: {
        leagueId,
        createdAt: {
          gte: tenMinutesAgo,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      distinct: ['userId'],
      orderBy: {
        createdAt: 'desc',
      },
    });

    return activeUsers.map(msg => msg.user);
  }
}