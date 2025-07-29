"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserId = exports.InvalidUserIdError = void 0;
class InvalidUserIdError extends Error {
    constructor(userId) {
        super(`UserId inválido: ${userId}`);
        this.name = 'InvalidUserIdError';
    }
}
exports.InvalidUserIdError = InvalidUserIdError;
class UserId {
    constructor(value) {
        if (!UserId.isValid(value)) {
            throw new InvalidUserIdError(value);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(userId) {
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidV4Regex.test(userId);
    }
    equals(other) {
        return this._value === other._value;
    }
}
exports.UserId = UserId;
//# sourceMappingURL=user-id.js.map