import { ApiProperty } from '@nestjs/swagger';

export class MarketOptionDto {
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  odds: number;
}

export class MarketResponseDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  type: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty({ type: [MarketOptionDto] })
  options: MarketOptionDto[];
  
  @ApiProperty()
  isActive: boolean;
  
  static from(market: any): MarketResponseDto {
    return {
      id: market.id,
      type: market.type,
      name: market.name,
      options: market.options,
      isActive: market.isActive
    };
  }
}