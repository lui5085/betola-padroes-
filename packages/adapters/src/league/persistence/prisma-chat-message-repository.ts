import { ChatMessage } from '@betola/core';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../auth/persistence/prisma';
import { LeagueId } from '@betola/core/shared/types/league-id';
import { UserId } from '@betola/core/shared/types/user-id';
import { Timestamp } from '@betola/core/shared/types/timestamp';

export class PrismaChatMessageRepository {
    async create(chatMessage: ChatMessage): Promise<void> {
        await prisma.chatMessage.create({
            data: {
                id: chatMessage.id,
                leagueId: chatMessage.leagueId.value,
                userId: chatMessage.userId.value,
                message: chatMessage.message,
                createdAt: chatMessage.createdAt.value,
            },
        });
    }

    async findByLeagueId(leagueId: LeagueId): Promise<ChatMessage[]> {
        const messages = await prisma.chatMessage.findMany({
            where: {
                leagueId: leagueId.value,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return messages.map(message => new ChatMessage(
            {
                leagueId: new LeagueId(message.leagueId),
                userId: new UserId(message.userId),
                message: message.message,
            },
            message.id,
            new Timestamp(message.createdAt),
        ));
    }

    async findByLeagueIdAndUserId(leagueId: LeagueId, userId: UserId): Promise<ChatMessage[]> {
        const messages = await prisma.chatMessage.findMany({
            where: {
                leagueId: leagueId.value,
                userId: userId.value,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return messages.map(message => new ChatMessage(
            {
                leagueId: new LeagueId(message.leagueId),
                userId: new UserId(message.userId),
                message: message.message,
            },
            message.id,
            new Timestamp(message.createdAt),
        ));
    }
} 