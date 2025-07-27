import { FootballApiConfig } from '@betola/core/modules/matches/domain/services/football-api-service';

export const createFootballApiConfig = (): FootballApiConfig => {
  const apiKey = process.env.FOOTBALL_API_KEY;
  const baseUrl = process.env.FOOTBALL_API_BASE_URL || 'https://v3.football.api-sports.io';

  if (!apiKey) {
    throw new Error('FOOTBALL_API_KEY environment variable is required');
  }

  return {
    apiKey,
    baseUrl,
    cacheTtl: {
      leagues: 43200, // 12 hours
      standings: 3600, // 1 hour  
      fixtures: 300,   // 5 minutes
      liveMatches: 60  // 1 minute
    }
  };
};