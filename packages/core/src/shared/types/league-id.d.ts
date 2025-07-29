export declare class InvalidLeagueIdError extends Error {
    constructor(leagueId: string);
}
export declare class LeagueId {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    static isValid(leagueId: string): boolean;
    equals(other: LeagueId): boolean;
}
