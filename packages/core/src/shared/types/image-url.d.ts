export declare class InvalidImageUrlError extends Error {
    constructor(imageUrl: string);
}
export declare class ImageUrl {
    private readonly _value;
    constructor(value: string | null);
    get value(): string | null;
    static isValid(imageUrl: string): boolean;
    equals(other: ImageUrl): boolean;
    static create(value: string | null): ImageUrl;
}
