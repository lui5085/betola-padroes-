import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { LeagueService } from './league.service';
import { CreateLeagueDto } from './dto/create-league.dto';
import { UpdateLeagueDto } from './dto/update-league.dto';
import { LeagueResponseDto } from './dto/league-response.dto';

@Controller('leagues')
export class LeagueController {
    constructor(private readonly leagueService: LeagueService) { }

    @Post()
    async createLeague(
        @Body() createLeagueDto: CreateLeagueDto,
    ): Promise<LeagueResponseDto> {
        // TODO: Extrair userId do token JWT
        const userId = 'temp-user-id';
        return this.leagueService.createLeague(createLeagueDto, userId);
    }

    @Get()
    async getUserLeagues(): Promise<LeagueResponseDto[]> {
        // TODO: Extrair userId do token JWT
        const userId = 'temp-user-id';
        return this.leagueService.getUserLeagues(userId);
    }

    @Get(':id')
    async getLeague(@Param('id') id: string): Promise<LeagueResponseDto> {
        return this.leagueService.getLeague(id);
    }

    @Patch(':id')
    async updateLeague(
        @Param('id') id: string,
        @Body() updateLeagueDto: UpdateLeagueDto,
    ): Promise<LeagueResponseDto> {
        // TODO: Extrair userId do token JWT
        const userId = 'temp-user-id';
        return this.leagueService.updateLeague(id, updateLeagueDto, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteLeague(@Param('id') id: string): Promise<void> {
        // TODO: Extrair userId do token JWT
        const userId = 'temp-user-id';
        return this.leagueService.deleteLeague(id, userId);
    }

    @Post(':id/join')
    @HttpCode(HttpStatus.OK)
    async joinLeague(@Param('id') id: string): Promise<LeagueResponseDto> {
        // TODO: Extrair userId do token JWT
        const userId = 'temp-user-id';
        return this.leagueService.joinLeague(id, userId);
    }

    @Post(':id/leave')
    @HttpCode(HttpStatus.OK)
    async leaveLeague(@Param('id') id: string): Promise<LeagueResponseDto> {
        // TODO: Extrair userId do token JWT
        const userId = 'temp-user-id';
        return this.leagueService.leaveLeague(id, userId);
    }

    @Get(':id/participants')
    async getLeagueParticipants(@Param('id') id: string): Promise<any[]> {
        return this.leagueService.getLeagueParticipants(id);
    }
} 