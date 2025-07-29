export declare class InvalidEmailError extends Error {
    constructor(email: string);
}
export declare class Email {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    static isValid(email: string): boolean;
    equals(other: Email): boolean;
}
