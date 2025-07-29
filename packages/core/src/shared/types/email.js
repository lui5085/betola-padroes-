"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = exports.InvalidEmailError = void 0;
class InvalidEmailError extends Error {
    constructor(email) {
        super(`Email inválido: ${email}`);
        this.name = 'InvalidEmailError';
    }
}
exports.InvalidEmailError = InvalidEmailError;
class Email {
    constructor(value) {
        if (!Email.isValid(value)) {
            throw new InvalidEmailError(value);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    equals(other) {
        return this._value === other._value;
    }
}
exports.Email = Email;
//# sourceMappingURL=email.js.map