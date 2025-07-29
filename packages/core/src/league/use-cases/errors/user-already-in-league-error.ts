export class UserAlreadyInLeagueError extends Error {
    constructor(userId: string, leagueId: string) {
        super(`Usuário ${userId} já está na liga ${leagueId}`);
        this.name = 'UserAlreadyInLeagueError';
    }
} 