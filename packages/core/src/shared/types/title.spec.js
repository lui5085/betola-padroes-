"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const title_1 = require("./title");
describe('Title', () => {
    describe('constructor', () => {
        it('should create a valid Title with minimum length', () => {
            const title = new title_1.Title('abc');
            expect(title.value).toBe('abc');
        });
        it('should create a valid Title with maximum length', () => {
            const longTitle = 'a'.repeat(50);
            const title = new title_1.Title(longTitle);
            expect(title.value).toBe(longTitle);
        });
        it('should throw InvalidTitleError for title too short', () => {
            expect(() => new title_1.Title('ab')).toThrow(title_1.InvalidTitleError);
        });
        it('should throw InvalidTitleError for title too long', () => {
            const tooLongTitle = 'a'.repeat(51);
            expect(() => new title_1.Title(tooLongTitle)).toThrow(title_1.InvalidTitleError);
        });
        it('should throw InvalidTitleError for empty string', () => {
            expect(() => new title_1.Title('')).toThrow(title_1.InvalidTitleError);
        });
    });
    describe('isValid', () => {
        it('should return true for valid titles', () => {
            const validTitles = [
                'abc',
                'My League',
                'a'.repeat(50),
                'Liga de Futebol 2024',
            ];
            validTitles.forEach(title => {
                expect(title_1.Title.isValid(title)).toBe(true);
            });
        });
        it('should return false for invalid titles', () => {
            const invalidTitles = [
                'ab',
                'a'.repeat(51),
                '',
            ];
            invalidTitles.forEach(title => {
                expect(title_1.Title.isValid(title)).toBe(false);
            });
        });
    });
    describe('equals', () => {
        it('should return true for equal titles', () => {
            const title1 = new title_1.Title('My League');
            const title2 = new title_1.Title('My League');
            expect(title1.equals(title2)).toBe(true);
        });
        it('should return false for different titles', () => {
            const title1 = new title_1.Title('My League');
            const title2 = new title_1.Title('Other League');
            expect(title1.equals(title2)).toBe(false);
        });
    });
});
//# sourceMappingURL=title.spec.js.map