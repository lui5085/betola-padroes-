import { FootballApiConfig } from '@betola/core/modules/matches/domain/services/football-api-service';

export const createFootballApiConfig = (): FootballApiConfig => {
  const apiKey = process.env.FLASHSCORE_API_KEY;
  const baseUrl = process.env.FLASHSCORE_BASE_URL || 'https://flashscore4.p.rapidapi.com/api/flashscore/v2';

  if (!apiKey) {
    throw new Error('FLASHSCORE_API_KEY environment variable is required');
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
