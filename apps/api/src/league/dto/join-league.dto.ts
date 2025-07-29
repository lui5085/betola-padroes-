import { IsString, IsUUID } from 'class-validator';

export class JoinLeagueDto {
    @IsString()
    @IsUUID()
    leagueId!: string;
} 