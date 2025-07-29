import { ILeagueParticipantRepository, LeagueParticipant } from '@betola/core';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../auth/persistence/prisma';
import { LeagueId } from '@betola/core/shared/types/league-id';
import { UserId } from '@betola/core/shared/types/user-id';
import { Timestamp } from '@betola/core/shared/types/timestamp';

export class PrismaLeagueParticipantRepository implements ILeagueParticipantRepository {
    async create(participant: LeagueParticipant): Promise<void> {
        await prisma.leagueParticipant.create({
            data: {
                id: participant.id,
                leagueId: participant.leagueId.value,
                userId: participant.userId.value,
                joinedAt: participant.joinedAt.value,
            },
        });
    }

    async findByLeagueId(leagueId: LeagueId): Promise<LeagueParticipant[]> {
        const participants = await prisma.leagueParticipant.findMany({
            where: {
                leagueId: leagueId.value,
            },
        });

        return participants.map(participant => new LeagueParticipant(
            {
                leagueId: new LeagueId(participant.leagueId),
                userId: new UserId(participant.userId),
            },
            participant.id,
            new Timestamp(participant.joinedAt),
        ));
    }

    async findByUserId(userId: UserId): Promise<LeagueParticipant[]> {
        const participants = await prisma.leagueParticipant.findMany({
            where: {
                userId: userId.value,
            },
        });

        return participants.map(participant => new LeagueParticipant(
            {
                leagueId: new LeagueId(participant.leagueId),
                userId: new UserId(participant.userId),
            },
            participant.id,
            new Timestamp(participant.joinedAt),
        ));
    }

    async findByLeagueIdAndUserId(leagueId: LeagueId, userId: UserId): Promise<LeagueParticipant | null> {
        const participant = await prisma.leagueParticipant.findUnique({
            where: {
                leagueId_userId: {
                    leagueId: leagueId.value,
                    userId: userId.value,
                },
            },
        });

        if (!participant) {
            return null;
        }

        return new LeagueParticipant(
            {
                leagueId: new LeagueId(participant.leagueId),
                userId: new UserId(participant.userId),
            },
            participant.id,
            new Timestamp(participant.joinedAt),
        );
    }

    async delete(leagueId: LeagueId, userId: UserId): Promise<void> {
        await prisma.leagueParticipant.delete({
            where: {
                leagueId_userId: {
                    leagueId: leagueId.value,
                    userId: userId.value,
                },
            },
        });
    }

    async countByLeagueId(leagueId: LeagueId): Promise<number> {
        return await prisma.leagueParticipant.count({
            where: {
                leagueId: leagueId.value,
            },
        });
    }
} 