export declare class InvalidTokenError extends Error {
    constructor(token: string);
}
export declare class Token {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    static isValid(token: string): boolean;
    equals(other: Token): boolean;
}
