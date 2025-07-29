// packages/core/shared/types/image-url.ts

export class InvalidImageUrlError extends Error {
    constructor(imageUrl: string) {
        super(`URL de imagem inválida: ${imageUrl}`);
        this.name = 'InvalidImageUrlError';
    }
}

export class ImageUrl {
    private readonly _value: string | null;

    constructor(value: string | null) {
        if (value !== null && !ImageUrl.isValid(value)) {
            throw new InvalidImageUrlError(value);
        }
        this._value = value;
    }

    get value(): string | null {
        return this._value;
    }

    static isValid(imageUrl: string): boolean {
        try {
            const url = new URL(imageUrl);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    equals(other: ImageUrl): boolean {
        return this._value === other._value;
    }

    static create(value: string | null): ImageUrl {
        return new ImageUrl(value);
    }
} 