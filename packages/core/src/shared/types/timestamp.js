"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timestamp = exports.InvalidTimestampError = void 0;
class InvalidTimestampError extends Error {
    constructor(timestamp) {
        super(`Timestamp inválido: ${timestamp}`);
        this.name = 'InvalidTimestampError';
    }
}
exports.InvalidTimestampError = InvalidTimestampError;
class Timestamp {
    constructor(value) {
        if (!Timestamp.isValid(value)) {
            throw new InvalidTimestampError(value);
        }
        this._value = value instanceof Date ? value : new Date(value);
    }
    get value() {
        return this._value;
    }
    static isValid(value) {
        if (value instanceof Date) {
            return !isNaN(value.getTime());
        }
        const date = new Date(value);
        return !isNaN(date.getTime());
    }
    equals(other) {
        return this._value.getTime() === other._value.getTime();
    }
}
exports.Timestamp = Timestamp;
//# sourceMappingURL=timestamp.js.map