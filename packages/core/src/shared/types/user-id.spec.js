"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_id_1 = require("./user-id");
describe('UserId', () => {
    it('deve criar um UserId válido (UUID v4)', () => {
        const uuid = '6f1a7e2e-3b2a-4c8e-8e2a-7b2e3c8e2a7b';
        const userId = new user_id_1.UserId(uuid);
        expect(userId.value).toBe(uuid);
    });
    it('deve lançar erro para UserId inválido', () => {
        const invalidUuid = 'not-a-uuid';
        expect(() => new user_id_1.UserId(invalidUuid)).toThrow(user_id_1.InvalidUserIdError);
    });
    it('deve comparar igualdade corretamente', () => {
        const uuid = '6f1a7e2e-3b2a-4c8e-8e2a-7b2e3c8e2a7b';
        const userId1 = new user_id_1.UserId(uuid);
        const userId2 = new user_id_1.UserId(uuid);
        expect(userId1.equals(userId2)).toBe(true);
    });
    it('deve diferenciar UserIds diferentes', () => {
        const uuid1 = '6f1a7e2e-3b2a-4c8e-8e2a-7b2e3c8e2a7b';
        const uuid2 = '7e2a7b2e-8e2a-4c8e-9b2e-6f1a7e2e3b2a';
        const userId1 = new user_id_1.UserId(uuid1);
        const userId2 = new user_id_1.UserId(uuid2);
        expect(userId1.equals(userId2)).toBe(false);
    });
});
//# sourceMappingURL=user-id.spec.js.map