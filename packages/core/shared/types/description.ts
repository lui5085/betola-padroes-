// packages/core/shared/types/description.ts

export class InvalidDescriptionError extends Error {
    constructor(description: string) {
        super(`Descrição inválida: ${description}. Deve ter no máximo 255 caracteres.`);
        this.name = 'InvalidDescriptionError';
    }
}

export class Description {
    private readonly _value: string | null;

    constructor(value: string | null) {
        if (value !== null && !Description.isValid(value)) {
            throw new InvalidDescriptionError(value);
        }
        this._value = value;
    }

    get value(): string | null {
        return this._value;
    }

    static isValid(description: string): boolean {
        return description.length <= 255;
    }

    equals(other: Description): boolean {
        return this._value === other._value;
    }

    static create(value: string | null): Description {
        return new Description(value);
    }
} 