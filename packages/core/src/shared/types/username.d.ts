export declare class InvalidUsernameError extends Error {
    constructor(message: string);
}
export declare class Username {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    static isValid(username: string): boolean;
    equals(other: Username): boolean;
    get length(): number;
    isLong(): boolean;
    toLowerCase(): string;
}
