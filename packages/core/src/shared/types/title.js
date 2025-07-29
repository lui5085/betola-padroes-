"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Title = exports.InvalidTitleError = void 0;
class InvalidTitleError extends Error {
    constructor(title) {
        super(`Título inválido: ${title}. Deve ter entre 3 e 50 caracteres.`);
        this.name = 'InvalidTitleError';
    }
}
exports.InvalidTitleError = InvalidTitleError;
class Title {
    constructor(value) {
        if (!Title.isValid(value)) {
            throw new InvalidTitleError(value);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(title) {
        return title.length >= 3 && title.length <= 50;
    }
    equals(other) {
        return this._value === other._value;
    }
}
exports.Title = Title;
//# sourceMappingURL=title.js.map