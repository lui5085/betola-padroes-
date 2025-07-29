export declare class InvalidTitleError extends Error {
    constructor(title: string);
}
export declare class Title {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    static isValid(title: string): boolean;
    equals(other: Title): boolean;
}
