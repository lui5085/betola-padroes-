// packages/core/shared/types/league-id.ts

export class InvalidLeagueIdError extends Error {
    constructor(leagueId: string) {
        super(`LeagueId inválido: ${leagueId}`);
        this.name = 'InvalidLeagueIdError';
    }
}

export class LeagueId {
    private readonly _value: string;

    constructor(value: string) {
        if (!LeagueId.isValid(value)) {
            throw new InvalidLeagueIdError(value);
        }
        this._value = value;
    }

    get value(): string {
        return this._value;
    }

    static isValid(leagueId: string): boolean {
        // Regex para UUID v4
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidV4Regex.test(leagueId);
    }

    equals(other: LeagueId): boolean {
        return this._value === other._value;
    }
} 