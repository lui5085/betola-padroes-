"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUrl = exports.InvalidImageUrlError = void 0;
class InvalidImageUrlError extends Error {
    constructor(imageUrl) {
        super(`URL de imagem inválida: ${imageUrl}`);
        this.name = 'InvalidImageUrlError';
    }
}
exports.InvalidImageUrlError = InvalidImageUrlError;
class ImageUrl {
    constructor(value) {
        if (value !== null && !ImageUrl.isValid(value)) {
            throw new InvalidImageUrlError(value);
        }
        this._value = value;
    }
    get value() {
        return this._value;
    }
    static isValid(imageUrl) {
        try {
            const url = new URL(imageUrl);
            return url.protocol === 'http:' || url.protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    equals(other) {
        return this._value === other._value;
    }
    static create(value) {
        return new ImageUrl(value);
    }
}
exports.ImageUrl = ImageUrl;
//# sourceMappingURL=image-url.js.map