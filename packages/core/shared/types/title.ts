// packages/core/shared/types/title.ts

export class InvalidTitleError extends Error {
    constructor(title: string) {
        super(`Título inválido: ${title}. Deve ter entre 3 e 50 caracteres.`);
        this.name = 'InvalidTitleError';
    }
}

export class Title {
    private readonly _value: string;

    constructor(value: string) {
        if (!Title.isValid(value)) {
            throw new InvalidTitleError(value);
        }
        this._value = value;
    }

    get value(): string {
        return this._value;
    }

    static isValid(title: string): boolean {
        return title.length >= 3 && title.length <= 50;
    }

    equals(other: Title): boolean {
        return this._value === other._value;
    }
} 