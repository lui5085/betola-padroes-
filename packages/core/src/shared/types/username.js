"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Username = exports.InvalidUsernameError = void 0;
class InvalidUsernameError extends Error {
    constructor(message) {
        super(`Nome de usuário inválido: ${message}`);
        this.name = 'InvalidUsernameError';
    }
}
exports.InvalidUsernameError = InvalidUsernameError;
class Username {
    constructor(value) {
        if (!Username.isValid(value)) {
            throw new InvalidUsernameError('O nome de usuário deve ter entre 3 e 20 caracteres, apenas letras, números, hífen e underscore.');
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(username) {
        const minLength = 3;
        const maxLength = 20;
        if (username.length < minLength || username.length > maxLength) {
            return false;
        }
        const validFormat = /^[a-zA-Z0-9_-]+$/.test(username);
        if (!validFormat) {
            return false;
        }
        if (/^[-_]|[-_]$/.test(username)) {
            return false;
        }
        if (/[-_]{2}/.test(username)) {
            return false;
        }
        return true;
    }
    equals(other) {
        return this._value === other._value;
    }
    get length() {
        return this._value.length;
    }
    isLong() {
        return this._value.length >= 15;
    }
    toLowerCase() {
        return this._value.toLowerCase();
    }
}
exports.Username = Username;
//# sourceMappingURL=username.js.map