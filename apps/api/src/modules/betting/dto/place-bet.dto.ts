import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class BetSelectionDto {
  @ApiProperty()
  @IsString()
  matchId: string;

  @ApiProperty()
  @IsString()
  marketId: string;

  @ApiProperty()
  @IsString()
  optionName: string;

  @ApiProperty({ minimum: 1.01 })
  @IsNumber()
  @Min(1.01)
  odds: number;
}

export enum BetType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
  SYSTEM = 'SYSTEM'
}

export class PlaceBetDto {
  @ApiProperty({ type: [BetSelectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BetSelectionDto)
  selections: BetSelectionDto[];

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: BetType, default: BetType.SINGLE })
  @IsEnum(BetType)
  type: BetType = BetType.SINGLE;
}