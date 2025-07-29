export class LeagueFullError extends Error {
    constructor(leagueId: string) {
        super(`Liga está cheia: ${leagueId}`);
        this.name = 'LeagueFullError';
    }
} 