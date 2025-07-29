"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const image_url_1 = require("./image-url");
describe('ImageUrl', () => {
    describe('constructor', () => {
        it('should create a valid ImageUrl with null value', () => {
            const imageUrl = new image_url_1.ImageUrl(null);
            expect(imageUrl.value).toBe(null);
        });
        it('should create a valid ImageUrl with HTTP URL', () => {
            const url = 'http://example.com/image.jpg';
            const imageUrl = new image_url_1.ImageUrl(url);
            expect(imageUrl.value).toBe(url);
        });
        it('should create a valid ImageUrl with HTTPS URL', () => {
            const url = 'https://example.com/image.png';
            const imageUrl = new image_url_1.ImageUrl(url);
            expect(imageUrl.value).toBe(url);
        });
        it('should throw InvalidImageUrlError for invalid URL', () => {
            const invalidUrl = 'not-a-url';
            expect(() => new image_url_1.ImageUrl(invalidUrl)).toThrow(image_url_1.InvalidImageUrlError);
        });
        it('should throw InvalidImageUrlError for FTP URL', () => {
            const ftpUrl = 'ftp://example.com/image.jpg';
            expect(() => new image_url_1.ImageUrl(ftpUrl)).toThrow(image_url_1.InvalidImageUrlError);
        });
        it('should throw InvalidImageUrlError for relative URL', () => {
            const relativeUrl = '/images/photo.jpg';
            expect(() => new image_url_1.ImageUrl(relativeUrl)).toThrow(image_url_1.InvalidImageUrlError);
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
                expect(image_url_1.ImageUrl.isValid(url)).toBe(true);
            });
        });
        it('should return true for valid HTTPS URLs', () => {
            const validHttpsUrls = [
                'https://example.com/image.jpg',
                'https://subdomain.example.com/photo.png',
                'https://example.com/path/to/image.gif',
            ];
            validHttpsUrls.forEach(url => {
                expect(image_url_1.ImageUrl.isValid(url)).toBe(true);
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
                expect(image_url_1.ImageUrl.isValid(url)).toBe(false);
            });
        });
    });
    describe('equals', () => {
        it('should return true for equal URLs', () => {
            const url = 'https://example.com/image.jpg';
            const imageUrl1 = new image_url_1.ImageUrl(url);
            const imageUrl2 = new image_url_1.ImageUrl(url);
            expect(imageUrl1.equals(imageUrl2)).toBe(true);
        });
        it('should return true for both null URLs', () => {
            const imageUrl1 = new image_url_1.ImageUrl(null);
            const imageUrl2 = new image_url_1.ImageUrl(null);
            expect(imageUrl1.equals(imageUrl2)).toBe(true);
        });
        it('should return false for different URLs', () => {
            const imageUrl1 = new image_url_1.ImageUrl('https://example.com/image1.jpg');
            const imageUrl2 = new image_url_1.ImageUrl('https://example.com/image2.jpg');
            expect(imageUrl1.equals(imageUrl2)).toBe(false);
        });
        it('should return false when one is null and other is not', () => {
            const imageUrl1 = new image_url_1.ImageUrl(null);
            const imageUrl2 = new image_url_1.ImageUrl('https://example.com/image.jpg');
            expect(imageUrl1.equals(imageUrl2)).toBe(false);
        });
    });
    describe('create', () => {
        it('should create ImageUrl with null value', () => {
            const imageUrl = image_url_1.ImageUrl.create(null);
            expect(imageUrl.value).toBe(null);
        });
        it('should create ImageUrl with string value', () => {
            const url = 'https://example.com/image.jpg';
            const imageUrl = image_url_1.ImageUrl.create(url);
            expect(imageUrl.value).toBe(url);
        });
    });
});
//# sourceMappingURL=image-url.spec.js.map