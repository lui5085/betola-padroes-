import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class JoinLeagueDto {
  @ApiProperty({ 
    description: 'League invite code (6 characters, letters and numbers)', 
    example: 'ABC123',
    pattern: '^[A-Z0-9]{6}$'
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^[A-Z0-9]{6}$/, { message: 'Code must be 6 uppercase letters and numbers' })
  code: string;
}