export declare class InvalidUserIdError extends Error {
    constructor(userId: string);
}
export declare class UserId {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    static isValid(userId: string): boolean;
    equals(other: UserId): boolean;
}
