import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateLeagueDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @IsOptional()
    title?: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
} 