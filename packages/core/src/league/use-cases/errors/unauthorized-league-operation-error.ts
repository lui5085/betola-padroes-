export class UnauthorizedLeagueOperationError extends Error {
    constructor(userId: string, leagueId: string, operation: string) {
        super(`Usuário ${userId} não tem permissão para ${operation} na liga ${leagueId}`);
        this.name = 'UnauthorizedLeagueOperationError';
    }
} 