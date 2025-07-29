"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeagueId = exports.InvalidLeagueIdError = void 0;
class InvalidLeagueIdError extends Error {
    constructor(leagueId) {
        super(`LeagueId inválido: ${leagueId}`);
        this.name = 'InvalidLeagueIdError';
    }
}
exports.InvalidLeagueIdError = InvalidLeagueIdError;
class LeagueId {
    constructor(value) {
        if (!LeagueId.isValid(value)) {
            throw new InvalidLeagueIdError(value);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(leagueId) {
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidV4Regex.test(leagueId);
    }
    equals(other) {
        return this._value === other._value;
    }
}
exports.LeagueId = LeagueId;
//# sourceMappingURL=league-id.js.map