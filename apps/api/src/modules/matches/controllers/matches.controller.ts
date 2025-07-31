import { Controller, Get, Post, Param, Query, UseGuards, NotFoundException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetUpcomingMatchesUseCase } from '../use-cases/get-upcoming-matches.use-case';
import { GetMatchMarketsUseCase } from '../use-cases/get-match-markets.use-case';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MatchResponseDto } from '../dto/match-response.dto';
import { MarketResponseDto } from '../dto/market-response.dto';
import { GetMatchesQueryDto } from '../dto/get-matches-query.dto';
import { MatchSyncService } from '../services/match-sync-service';
import { FootballApiService } from '@betola/core/modules/matches/domain/services/football-api-service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AutoMarketsService } from '../../betting/services/auto-markets.service';

@Controller('matches')
@ApiTags('matches')
export class MatchesController {
  constructor(
    private readonly getUpcomingMatchesUseCase: GetUpcomingMatchesUseCase,
    private readonly getMatchMarketsUseCase: GetMatchMarketsUseCase,
    private readonly matchSyncService: MatchSyncService,
    @Inject('FootballApiService') private readonly footballApiService: FootballApiService,
    private readonly autoMarketsService: AutoMarketsService
  ) {}
  
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get matches' })
  async getMatches(@Query() query: GetMatchesQueryDto): Promise<MatchResponseDto[]> {
    const result = await this.getUpcomingMatchesUseCase.execute({
      limit: query.limit,
      status: query.status
    });
    
    // Auto-create markets for matches that don't have them
    // First, sync matches to database to get internal UUIDs
    await this.syncMatchesToDatabase(result.value);
    
    // Now fetch matches with markets from database
    const matchesWithMarkets = await this.getMatchesWithMarkets();
    
    return matchesWithMarkets.map(match => MatchResponseDto.from(match));
  }

  @Get('debug/preview')
  @ApiOperation({ summary: 'Preview matches without authentication (for testing)' })
  async previewMatches(@Query() query: GetMatchesQueryDto): Promise<any[]> {
    const result = await this.getUpcomingMatchesUseCase.execute({
      limit: query.limit || 10,
      status: query.status
    });
    
    return result.value;
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get match details' })
  async getMatchDetails(@Param('id') matchId: string): Promise<MatchResponseDto> {
    const result = await this.getUpcomingMatchesUseCase.execute({ matchId });
    
    if (!result.value.length) {
      throw new NotFoundException('Match not found');
    }
    
    return MatchResponseDto.from(result.value[0]);
  }
  
  @Get(':id/markets')
  @ApiOperation({ summary: 'Get match betting markets' })
  async getMatchMarkets(@Param('id') matchId: string): Promise<MarketResponseDto[]> {
    const result = await this.getMatchMarketsUseCase.execute({ matchId });
    
    return result.value.map(market => MarketResponseDto.from(market));
  }

  @Post('sync')
  @ApiOperation({ summary: 'Manually sync matches from Football API and save to database' })
  async syncMatches() {
    try {
      console.log('🔄 Starting match sync process...');
      
      // Get matches from API
      const result = await this.getUpcomingMatchesUseCase.execute({ limit: 10 });
      
      if (!result.value || result.value.length === 0) {
        return {
          success: false,
          error: 'No matches found from API'
        };
      }

      console.log(`📊 Found ${result.value.length} matches from API`);

      // Use Prisma to save matches and teams to database
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      let savedMatches = 0;
      let savedTeams = 0;

      for (const match of result.value) {
        try {
          // Create or update home team
          const homeTeam = await prisma.team.upsert({
            where: { externalId: match.homeTeam.id },
            update: {
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName,
              logoUrl: match.homeTeam.logoUrl
            },
            create: {
              id: this.generateUUID(),
              externalId: match.homeTeam.id,
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName,
              logoUrl: match.homeTeam.logoUrl
            }
          });

          // Create or update away team
          const awayTeam = await prisma.team.upsert({
            where: { externalId: match.awayTeam.id },
            update: {
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName,
              logoUrl: match.awayTeam.logoUrl
            },
            create: {
              id: this.generateUUID(),
              externalId: match.awayTeam.id,
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName,
              logoUrl: match.awayTeam.logoUrl
            }
          });

          // Create or update match
          await prisma.match.upsert({
            where: { externalId: match.id },
            update: {
              kickoffTime: new Date(match.kickoffTime),
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              round: match.round || 1,
              season: match.season || '2025'
            },
            create: {
              id: this.generateUUID(),
              externalId: match.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffTime: new Date(match.kickoffTime),
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              round: match.round || 1,
              season: match.season || '2025'
            }
          });

          // Create markets for this match
          if (match.status === 'SCHEDULED') {
            await this.autoMarketsService.createMarketsForMatch(
              match.id,
              match.homeTeam.name,
              match.awayTeam.name
            );
          }

          savedMatches++;
          console.log(`✅ Saved match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        } catch (matchError) {
          console.error(`❌ Failed to save match ${match.id}: ${matchError.message}`);
        }
      }

      await prisma.$disconnect();

      return {
        success: true,
        message: 'Sync completed successfully',
        data: {
          totalMatches: result.value.length,
          savedMatches,
          savedTeams
        }
      };
    } catch (error) {
      console.error('❌ Sync error:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private async syncMatchesToDatabase(matches: any[]): Promise<void> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      for (const match of matches) {
        if (match.status !== 'SCHEDULED') continue;
        
        try {
          // Create or update home team
          const homeTeam = await prisma.team.upsert({
            where: { externalId: match.homeTeam.id },
            update: {
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName,
              logoUrl: match.homeTeam.logoUrl
            },
            create: {
              id: this.generateUUID(),
              externalId: match.homeTeam.id,
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName,
              logoUrl: match.homeTeam.logoUrl
            }
          });

          // Create or update away team
          const awayTeam = await prisma.team.upsert({
            where: { externalId: match.awayTeam.id },
            update: {
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName,
              logoUrl: match.awayTeam.logoUrl
            },
            create: {
              id: this.generateUUID(),
              externalId: match.awayTeam.id,
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName,
              logoUrl: match.awayTeam.logoUrl
            }
          });

          // Create or update match
          const savedMatch = await prisma.match.upsert({
            where: { externalId: match.id },
            update: {
              kickoffTime: new Date(match.kickoffTime),
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              round: match.round || 1,
              season: match.season || '2025'
            },
            create: {
              id: this.generateUUID(),
              externalId: match.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffTime: new Date(match.kickoffTime),
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              round: match.round || 1,
              season: match.season || '2025'
            }
          });

          // Now create markets using the internal UUID
          await this.autoMarketsService.createMarketsForMatch(
            savedMatch.id, // Use internal UUID, not external ID
            match.homeTeam.name,
            match.awayTeam.name
          ).catch(err => console.log(`Failed to create markets for ${savedMatch.id}:`, err.message));

        } catch (matchError) {
          console.error(`❌ Failed to sync match ${match.id}: ${matchError.message}`);
        }
      }

      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Failed to sync matches to database:', error);
    }
  }

  private async getMatchesWithMarkets(): Promise<any[]> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const matches = await prisma.match.findMany({
        where: {
          status: 'SCHEDULED',
          kickoffTime: {
            gte: new Date()
          }
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          markets: {
            where: {
              isActive: true
            }
          }
        },
        orderBy: {
          kickoffTime: 'asc'
        },
        take: 20
      });

      await prisma.$disconnect();
      
      return matches.map(match => ({
        id: match.id,
        homeTeam: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
          logoUrl: match.homeTeam.logoUrl
        },
        awayTeam: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
          logoUrl: match.awayTeam.logoUrl
        },
        kickoffTime: match.kickoffTime.toISOString(),
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        round: match.round,
        season: match.season,
        markets: match.markets
      }));
    } catch (error) {
      console.error('❌ Failed to fetch matches with markets:', error);
      return [];
    }
  }

  @Get('debug/test-api')
  @ApiOperation({ summary: 'Test Football API connection' })
  // Remove auth guard for testing
  async testApi() {
    try {
      console.log('Environment variables:', {
        FOOTBALL_API_KEY: process.env.FOOTBALL_API_KEY,
        FOOTBALL_API_BASE_URL: process.env.FOOTBALL_API_BASE_URL
      });
      
      const result = await this.footballApiService.getBrasileirao();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Football API Error:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        config: {
          apiKey: process.env.FOOTBALL_API_KEY ? 'presente' : 'ausente',
          baseUrl: process.env.FOOTBALL_API_BASE_URL
        }
      };
    }
  }

  @Get('debug/fetch-live')
  @ApiOperation({ summary: 'Force fetch live data from API' })
  async fetchLiveData(@CurrentUser() user: any) {
    try {
      console.log('Debug - Current user:', user);
      const useCase = this.getUpcomingMatchesUseCase as any;
      const apiData = await useCase.fetchFromApi(10);
      return {
        success: true,
        message: 'Fetched live data from API',
        user: user,
        data: apiData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Get('debug/user')
  @ApiOperation({ summary: 'Get current user info' })
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      user: user,
      timestamp: new Date().toISOString()
    };
  }

  @Post('debug/sync-to-db')
  @ApiOperation({ summary: 'Force sync matches to database for testing' })
  async forceSyncToDatabase() {
    try {
      console.log('🔄 Force syncing matches to database...');
      
      // Get matches from API
      const result = await this.getUpcomingMatchesUseCase.execute({ limit: 5 });
      
      if (!result.value || result.value.length === 0) {
        return {
          success: false,
          error: 'No matches found from API'
        };
      }

      console.log(`📊 Found ${result.value.length} matches from API`);

      // Use Prisma to save matches and teams to database
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      let savedMatches = 0;

      for (const match of result.value) {
        try {
          // Create or update home team
          const homeTeam = await prisma.team.upsert({
            where: { externalId: match.homeTeam.id },
            update: {
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName,
              logoUrl: match.homeTeam.logoUrl
            },
            create: {
              id: this.generateUUID(),
              externalId: match.homeTeam.id,
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName,
              logoUrl: match.homeTeam.logoUrl
            }
          });

          // Create or update away team
          const awayTeam = await prisma.team.upsert({
            where: { externalId: match.awayTeam.id },
            update: {
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName,
              logoUrl: match.awayTeam.logoUrl
            },
            create: {
              id: this.generateUUID(),
              externalId: match.awayTeam.id,
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName,
              logoUrl: match.awayTeam.logoUrl
            }
          });

          // Create or update match
          const savedMatch = await prisma.match.upsert({
            where: { externalId: match.id },
            update: {
              kickoffTime: new Date(match.kickoffTime),
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              round: match.round || 1,
              season: match.season || '2025'
            },
            create: {
              id: this.generateUUID(),
              externalId: match.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              kickoffTime: new Date(match.kickoffTime),
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              round: match.round || 1,
              season: match.season || '2025'
            }
          });

          // Create markets for this match
          if (match.status === 'SCHEDULED') {
            await this.autoMarketsService.createMarketsForMatch(
              match.id,
              match.homeTeam.name,
              match.awayTeam.name
            );
          }

          savedMatches++;
          console.log(`✅ Saved match: ${match.homeTeam.name} vs ${match.awayTeam.name} (DB ID: ${savedMatch.id})`);
        } catch (matchError) {
          console.error(`❌ Failed to save match ${match.id}: ${matchError.message}`);
        }
      }

      await prisma.$disconnect();

      return {
        success: true,
        message: 'Force sync completed successfully',
        data: {
          totalMatches: result.value.length,
          savedMatches
        }
      };
    } catch (error) {
      console.error('❌ Force sync error:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
}