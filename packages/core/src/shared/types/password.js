"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = exports.InvalidPasswordError = void 0;
class InvalidPasswordError extends Error {
    constructor(message) {
        super(`Senha inválida: ${message}`);
        this.name = 'InvalidPasswordError';
    }
}
exports.InvalidPasswordError = InvalidPasswordError;
class Password {
    constructor(value) {
        if (!Password.isValid(value)) {
            throw new InvalidPasswordError('A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial');
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\[\]\\/;'`~_+=-]/.test(password);
        return (password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar);
    }
    equals(other) {
        return this._value === other._value;
    }
    isStrong() {
        return this._value.length >= 12;
    }
    get length() {
        return this._value.length;
    }
}
exports.Password = Password;
//# sourceMappingURL=password.js.map