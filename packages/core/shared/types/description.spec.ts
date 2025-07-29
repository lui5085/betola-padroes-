import { Description, InvalidDescriptionError } from './description';

describe('Description', () => {
    describe('constructor', () => {
        it('should create a valid Description with null value', () => {
            const description = new Description(null);
            expect(description.value).toBe(null);
        });

        it('should create a valid Description with empty string', () => {
            const description = new Description('');
            expect(description.value).toBe('');
        });

        it('should create a valid Description with maximum length', () => {
            const longDescription = 'a'.repeat(255);
            const description = new Description(longDescription);
            expect(description.value).toBe(longDescription);
        });

        it('should throw InvalidDescriptionError for description too long', () => {
            const tooLongDescription = 'a'.repeat(256);
            expect(() => new Description(tooLongDescription)).toThrow(InvalidDescriptionError);
        });
    });

    describe('isValid', () => {
        it('should return true for valid descriptions', () => {
            const validDescriptions = [
                '',
                'Short description',
                'a'.repeat(255),
                'Uma descrição em português com acentos e caracteres especiais!',
            ];

            validDescriptions.forEach(description => {
                expect(Description.isValid(description)).toBe(true);
            });
        });

        it('should return false for invalid descriptions', () => {
            const invalidDescriptions = [
                'a'.repeat(256),
                'a'.repeat(300),
            ];

            invalidDescriptions.forEach(description => {
                expect(Description.isValid(description)).toBe(false);
            });
        });
    });

    describe('equals', () => {
        it('should return true for equal descriptions', () => {
            const description1 = new Description('My description');
            const description2 = new Description('My description');
            expect(description1.equals(description2)).toBe(true);
        });

        it('should return true for both null descriptions', () => {
            const description1 = new Description(null);
            const description2 = new Description(null);
            expect(description1.equals(description2)).toBe(true);
        });

        it('should return false for different descriptions', () => {
            const description1 = new Description('My description');
            const description2 = new Description('Other description');
            expect(description1.equals(description2)).toBe(false);
        });

        it('should return false when one is null and other is not', () => {
            const description1 = new Description(null);
            const description2 = new Description('My description');
            expect(description1.equals(description2)).toBe(false);
        });
    });

    describe('create', () => {
        it('should create Description with null value', () => {
            const description = Description.create(null);
            expect(description.value).toBe(null);
        });

        it('should create Description with string value', () => {
            const description = Description.create('My description');
            expect(description.value).toBe('My description');
        });
    });
}); 