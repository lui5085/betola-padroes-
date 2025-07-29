export declare class InvalidDescriptionError extends Error {
    constructor(description: string);
}
export declare class Description {
    private readonly _value;
    constructor(value: string | null);
    get value(): string | null;
    static isValid(description: string): boolean;
    equals(other: Description): boolean;
    static create(value: string | null): Description;
}
