import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeagueDto {
  @ApiPropertyOptional({
    description: 'League name',
    example: 'Minha Liga Atualizada'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'League description',
    example: 'Liga atualizada para apostas entre amigos'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'League image URL',
    example: 'https://example.com/image.png'
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the league is private',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of members',
    example: 50,
    minimum: 2,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(1000)
  maxMembers?: number;
}