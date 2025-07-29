export class UserNotInLeagueError extends Error {
    constructor(userId: string, leagueId: string) {
        super(`Usuário ${userId} não está na liga ${leagueId}`);
        this.name = 'UserNotInLeagueError';
    }
} 