import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];
  
  @ApiProperty()
  total: number;
  
  @ApiProperty()
  page: number;
  
  @ApiProperty()
  totalPages: number;
}