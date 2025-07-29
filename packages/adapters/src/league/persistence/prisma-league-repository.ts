import { ILeagueRepository, League } from '@betola/core';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../auth/persistence/prisma';
import { LeagueId } from '@betola/core/shared/types/league-id';
import { UserId } from '@betola/core/shared/types/user-id';
import { Title } from '@betola/core/shared/types/title';
import { Description } from '@betola/core/shared/types/description';
import { ImageUrl } from '@betola/core/shared/types/image-url';
import { Timestamp } from '@betola/core/shared/types/timestamp';

export class PrismaLeagueRepository implements ILeagueRepository {
    async create(league: League): Promise<void> {
        await prisma.league.create({
            data: {
                id: league.id.value,
                title: league.title.value,
                description: league.description.value,
                imageUrl: league.imageUrl.value,
                ownerId: league.ownerId.value,
                createdAt: league.createdAt.value,
                updatedAt: league.updatedAt.value,
            },
        });
    }

    async findById(id: LeagueId): Promise<League | null> {
        const league = await prisma.league.findUnique({
            where: {
                id: id.value,
            },
        });

        if (!league) {
            return null;
        }

        return new League(
            {
                title: new Title(league.title),
                description: Description.create(league.description),
                imageUrl: ImageUrl.create(league.imageUrl),
                ownerId: new UserId(league.ownerId),
            },
            new LeagueId(league.id),
            new Timestamp(league.createdAt),
            new Timestamp(league.updatedAt),
        );
    }

    async findByOwnerId(ownerId: UserId): Promise<League[]> {
        const leagues = await prisma.league.findMany({
            where: {
                ownerId: ownerId.value,
            },
        });

        return leagues.map(league => new League(
            {
                title: new Title(league.title),
                description: Description.create(league.description),
                imageUrl: ImageUrl.create(league.imageUrl),
                ownerId: new UserId(league.ownerId),
            },
            new LeagueId(league.id),
            new Timestamp(league.createdAt),
            new Timestamp(league.updatedAt),
        ));
    }

    async save(league: League): Promise<void> {
        await prisma.league.update({
            where: {
                id: league.id.value,
            },
            data: {
                title: league.title.value,
                description: league.description.value,
                imageUrl: league.imageUrl.value,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: LeagueId): Promise<void> {
        await prisma.league.delete({
            where: {
                id: id.value,
            },
        });
    }
} 