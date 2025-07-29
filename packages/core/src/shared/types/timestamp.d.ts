export declare class InvalidTimestampError extends Error {
    constructor(timestamp: string | Date);
}
export declare class Timestamp {
    private readonly _value;
    constructor(value: string | Date);
    get value(): Date;
    static isValid(value: string | Date): boolean;
    equals(other: Timestamp): boolean;
}
