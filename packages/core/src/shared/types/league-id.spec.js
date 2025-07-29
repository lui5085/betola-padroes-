"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const league_id_1 = require("./league-id");
describe('LeagueId', () => {
    describe('constructor', () => {
        it('should create a valid LeagueId', () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            const leagueId = new league_id_1.LeagueId(validUuid);
            expect(leagueId.value).toBe(validUuid);
        });
        it('should throw InvalidLeagueIdError for invalid UUID', () => {
            const invalidUuid = 'invalid-uuid';
            expect(() => new league_id_1.LeagueId(invalidUuid)).toThrow(league_id_1.InvalidLeagueIdError);
        });
        it('should throw InvalidLeagueIdError for empty string', () => {
            expect(() => new league_id_1.LeagueId('')).toThrow(league_id_1.InvalidLeagueIdError);
        });
    });
    describe('isValid', () => {
        it('should return true for valid UUID v4', () => {
            const validUuids = [
                '550e8400-e29b-41d4-a716-446655440000',
                '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
                '6ba7b811-9dad-41d1-80b4-00c04fd430c8',
                '6ba7b812-9dad-41d1-80b4-00c04fd430c8',
                '6ba7b814-9dad-41d1-80b4-00c04fd430c8',
            ];
            validUuids.forEach(uuid => {
                expect(league_id_1.LeagueId.isValid(uuid)).toBe(true);
            });
        });
        it('should return false for invalid UUIDs', () => {
            const invalidUuids = [
                'invalid-uuid',
                '550e8400-e29b-41d4-a716-44665544000',
                '550e8400-e29b-41d4-a716-4466554400000',
                '550e8400-e29b-31d4-a716-446655440000',
                '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                '',
            ];
            invalidUuids.forEach(uuid => {
                expect(league_id_1.LeagueId.isValid(uuid)).toBe(false);
            });
        });
    });
    describe('equals', () => {
        it('should return true for equal LeagueIds', () => {
            const uuid = '550e8400-e29b-41d4-a716-446655440000';
            const leagueId1 = new league_id_1.LeagueId(uuid);
            const leagueId2 = new league_id_1.LeagueId(uuid);
            expect(leagueId1.equals(leagueId2)).toBe(true);
        });
        it('should return false for different LeagueIds', () => {
            const leagueId1 = new league_id_1.LeagueId('550e8400-e29b-41d4-a716-446655440000');
            const leagueId2 = new league_id_1.LeagueId('550e8400-e29b-41d4-a716-446655440001');
            expect(leagueId1.equals(leagueId2)).toBe(false);
        });
    });
});
//# sourceMappingURL=league-id.spec.js.map