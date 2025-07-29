export class LeagueResponseDto {
    id!: string;
    title!: string;
    description?: string;
    imageUrl?: string;
    ownerId!: string;
    createdAt!: Date;
    updatedAt!: Date;
} 