import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateLeagueDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    title!: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
} 