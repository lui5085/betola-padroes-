"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Description = exports.InvalidDescriptionError = void 0;
class InvalidDescriptionError extends Error {
    constructor(description) {
        super(`Descrição inválida: ${description}. Deve ter no máximo 255 caracteres.`);
        this.name = 'InvalidDescriptionError';
    }
}
exports.InvalidDescriptionError = InvalidDescriptionError;
class Description {
    constructor(value) {
        if (value !== null && !Description.isValid(value)) {
            throw new InvalidDescriptionError(value);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(description) {
        return description.length <= 255;
    }
    equals(other) {
        return this._value === other._value;
    }
    static create(value) {
        return new Description(value);
    }
}
exports.Description = Description;
//# sourceMappingURL=description.js.map