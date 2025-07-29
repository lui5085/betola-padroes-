import { ImageUrl, InvalidImageUrlError } from './image-url';

describe('ImageUrl', () => {
    describe('constructor', () => {
        it('should create a valid ImageUrl with null value', () => {
            const imageUrl = new ImageUrl(null);
            expect(imageUrl.value).toBe(null);
        });

        it('should create a valid ImageUrl with HTTP URL', () => {
            const url = 'http://example.com/image.jpg';
            const imageUrl = new ImageUrl(url);
            expect(imageUrl.value).toBe(url);
        });

        it('should create a valid ImageUrl with HTTPS URL', () => {
            const url = 'https://example.com/image.png';
            const imageUrl = new ImageUrl(url);
            expect(imageUrl.value).toBe(url);
        });

        it('should throw InvalidImageUrlError for invalid URL', () => {
            const invalidUrl = 'not-a-url';
            expect(() => new ImageUrl(invalidUrl)).toThrow(InvalidImageUrlError);
        });

        it('should throw InvalidImageUrlError for FTP URL', () => {
            const ftpUrl = 'ftp://example.com/image.jpg';
            expect(() => new ImageUrl(ftpUrl)).toThrow(InvalidImageUrlError);
        });

        it('should throw InvalidImageUrlError for relative URL', () => {
            const relativeUrl = '/images/photo.jpg';
            expect(() => new ImageUrl(relativeUrl)).toThrow(InvalidImageUrlError);
        });
    });

    describe('isValid', () => {
        it('should return true for valid HTTP URLs', () => {
            const validHttpUrls = [
                'http://example.com/image.jpg',
                'http://subdomain.example.com/photo.png',
                'http://example.com/path/to/image.gif',
            ];

            validHttpUrls.forEach(url => {
                expect(ImageUrl.isValid(url)).toBe(true);
            });
        });

        it('should return true for valid HTTPS URLs', () => {
            const validHttpsUrls = [
                'https://example.com/image.jpg',
                'https://subdomain.example.com/photo.png',
                'https://example.com/path/to/image.gif',
            ];

            validHttpsUrls.forEach(url => {
                expect(ImageUrl.isValid(url)).toBe(true);
            });
        });

        it('should return false for invalid URLs', () => {
            const invalidUrls = [
                'not-a-url',
                'ftp://example.com/image.jpg',
                '/images/photo.jpg',
                'file:///path/to/image.jpg',
                'data:image/jpeg;base64,abc123',
            ];

            invalidUrls.forEach(url => {
                expect(ImageUrl.isValid(url)).toBe(false);
            });
        });
    });

    describe('equals', () => {
        it('should return true for equal URLs', () => {
            const url = 'https://example.com/image.jpg';
            const imageUrl1 = new ImageUrl(url);
            const imageUrl2 = new ImageUrl(url);
            expect(imageUrl1.equals(imageUrl2)).toBe(true);
        });

        it('should return true for both null URLs', () => {
            const imageUrl1 = new ImageUrl(null);
            const imageUrl2 = new ImageUrl(null);
            expect(imageUrl1.equals(imageUrl2)).toBe(true);
        });

        it('should return false for different URLs', () => {
            const imageUrl1 = new ImageUrl('https://example.com/image1.jpg');
            const imageUrl2 = new ImageUrl('https://example.com/image2.jpg');
            expect(imageUrl1.equals(imageUrl2)).toBe(false);
        });

        it('should return false when one is null and other is not', () => {
            const imageUrl1 = new ImageUrl(null);
            const imageUrl2 = new ImageUrl('https://example.com/image.jpg');
            expect(imageUrl1.equals(imageUrl2)).toBe(false);
        });
    });

    describe('create', () => {
        it('should create ImageUrl with null value', () => {
            const imageUrl = ImageUrl.create(null);
            expect(imageUrl.value).toBe(null);
        });

        it('should create ImageUrl with string value', () => {
            const url = 'https://example.com/image.jpg';
            const imageUrl = ImageUrl.create(url);
            expect(imageUrl.value).toBe(url);
        });
    });
}); 