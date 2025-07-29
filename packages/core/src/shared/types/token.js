"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.InvalidTokenError = void 0;
class InvalidTokenError extends Error {
    constructor(token) {
        super(`Token inválido: ${token}`);
        this.name = 'InvalidTokenError';
    }
}
exports.InvalidTokenError = InvalidTokenError;
class Token {
    constructor(value) {
        if (!Token.isValid(value)) {
            throw new InvalidTokenError(value);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(token) {
        return /^[a-f0-9]{64}$/i.test(token);
    }
    equals(other) {
        return this._value === other._value;
    }
}
exports.Token = Token;
//# sourceMappingURL=token.js.map