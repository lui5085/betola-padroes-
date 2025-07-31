import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max, Length } from 'class-validator';

export class CreateLeagueDto {
  @ApiProperty({ description: 'League name', minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name: string;
  
  @ApiPropertyOptional({ description: 'League description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
  
  @ApiPropertyOptional({ description: 'League image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @ApiPropertyOptional({ description: 'Maximum number of members', minimum: 2, maximum: 500, default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(500)
  maxMembers?: number;
  
  @ApiPropertyOptional({ description: 'Whether the league is private', default: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}