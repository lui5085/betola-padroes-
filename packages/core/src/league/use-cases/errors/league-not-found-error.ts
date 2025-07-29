export class LeagueNotFoundError extends Error {
    constructor(leagueId: string) {
        super(`Liga não encontrada: ${leagueId}`);
        this.name = 'LeagueNotFoundError';
    }
} 