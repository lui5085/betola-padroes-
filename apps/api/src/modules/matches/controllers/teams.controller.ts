import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetBrasileraoTeamsUseCase } from '../use-cases/get-brasileirao-teams.use-case';
import { GetTeamDetailsUseCase } from '../use-cases/get-team-details.use-case';
import { GetBrasileraoStandingsUseCase } from '../use-cases/get-brasileirao-standings.use-case';
import { BrasileraoTeamDto, TeamDetailsDto, BrasileraoStandingsDto } from '../dto/team-response.dto';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly getBrasileraoTeamsUseCase: GetBrasileraoTeamsUseCase,
    private readonly getTeamDetailsUseCase: GetTeamDetailsUseCase,
    private readonly getBrasileraoStandingsUseCase: GetBrasileraoStandingsUseCase,
  ) {}

  @Get('brasileirao')
  async getBrasileraoTeams(): Promise<BrasileraoTeamDto[]> {
    const result = await this.getBrasileraoTeamsUseCase.execute();
    
    if (result.isFailure()) {
      throw new Error(result.error);
    }
    
    return result.value;
  }

  @Get('brasileirao/standings')
  async getBrasileraoStandings(): Promise<BrasileraoStandingsDto> {
    const result = await this.getBrasileraoStandingsUseCase.execute();
    
    if (result.isFailure()) {
      throw new Error(result.error);
    }
    
    return result.value;
  }

  @Get(':id')
  async getTeamDetails(@Param('id') teamId: string): Promise<TeamDetailsDto> {
    const result = await this.getTeamDetailsUseCase.execute(parseInt(teamId));
    
    if (result.isFailure()) {
      throw new Error(result.error);
    }
    
    return result.value;
  }
}