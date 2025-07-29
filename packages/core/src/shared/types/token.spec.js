"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("./token");
describe('Token', () => {
    it('deve criar um Token válido (64 hex)', () => {
        const token = 'a'.repeat(64);
        const t = new token_1.Token(token);
        expect(t.value).toBe(token);
    });
    it('deve lançar erro para Token inválido (tamanho errado)', () => {
        const invalidToken = 'a'.repeat(63);
        expect(() => new token_1.Token(invalidToken)).toThrow(token_1.InvalidTokenError);
    });
    it('deve lançar erro para Token inválido (caracteres não hex)', () => {
        const invalidToken = 'g'.repeat(64);
        expect(() => new token_1.Token(invalidToken)).toThrow(token_1.InvalidTokenError);
    });
    it('deve comparar igualdade corretamente', () => {
        const token = 'b'.repeat(64);
        const t1 = new token_1.Token(token);
        const t2 = new token_1.Token(token);
        expect(t1.equals(t2)).toBe(true);
    });
    it('deve diferenciar Tokens diferentes', () => {
        const token1 = 'c'.repeat(64);
        const token2 = 'd'.repeat(64);
        const t1 = new token_1.Token(token1);
        const t2 = new token_1.Token(token2);
        expect(t1.equals(t2)).toBe(false);
    });
});
//# sourceMappingURL=token.spec.js.map