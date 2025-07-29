import { Title, InvalidTitleError } from './title';

describe('Title', () => {
    describe('constructor', () => {
        it('should create a valid Title with minimum length', () => {
            const title = new Title('abc');
            expect(title.value).toBe('abc');
        });

        it('should create a valid Title with maximum length', () => {
            const longTitle = 'a'.repeat(50);
            const title = new Title(longTitle);
            expect(title.value).toBe(longTitle);
        });

        it('should throw InvalidTitleError for title too short', () => {
            expect(() => new Title('ab')).toThrow(InvalidTitleError);
        });

        it('should throw InvalidTitleError for title too long', () => {
            const tooLongTitle = 'a'.repeat(51);
            expect(() => new Title(tooLongTitle)).toThrow(InvalidTitleError);
        });

        it('should throw InvalidTitleError for empty string', () => {
            expect(() => new Title('')).toThrow(InvalidTitleError);
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
                expect(Title.isValid(title)).toBe(true);
            });
        });

        it('should return false for invalid titles', () => {
            const invalidTitles = [
                'ab',
                'a'.repeat(51),
                '',
            ];

            invalidTitles.forEach(title => {
                expect(Title.isValid(title)).toBe(false);
            });
        });
    });

    describe('equals', () => {
        it('should return true for equal titles', () => {
            const title1 = new Title('My League');
            const title2 = new Title('My League');
            expect(title1.equals(title2)).toBe(true);
        });

        it('should return false for different titles', () => {
            const title1 = new Title('My League');
            const title2 = new Title('Other League');
            expect(title1.equals(title2)).toBe(false);
        });
    });
}); 