export declare class InvalidPasswordError extends Error {
    constructor(message: string);
}
export declare class Password {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    static isValid(password: string): boolean;
    equals(other: Password): boolean;
    isStrong(): boolean;
    get length(): number;
}
