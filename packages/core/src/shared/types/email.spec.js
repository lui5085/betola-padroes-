"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_1 = require("./email");
describe('Email Value Object', () => {
    it('deve aceitar emails válidos', () => {
        const email = new email_1.Email('teste@exemplo.com');
        expect(email.value).toBe('teste@exemplo.com');
    });
    it('deve rejeitar emails inválidos', () => {
        expect(() => new email_1.Email('invalido')).toThrow(email_1.InvalidEmailError);
        expect(() => new email_1.Email('foo@bar')).toThrow(email_1.InvalidEmailError);
        expect(() => new email_1.Email('foo@.com')).toThrow(email_1.InvalidEmailError);
        expect(() => new email_1.Email('foo@bar.')).toThrow(email_1.InvalidEmailError);
    });
    it('deve comparar igualdade corretamente', () => {
        const email1 = new email_1.Email('a@b.com');
        const email2 = new email_1.Email('a@b.com');
        const email3 = new email_1.Email('c@d.com');
        expect(email1.equals(email2)).toBe(true);
        expect(email1.equals(email3)).toBe(false);
    });
});
//# sourceMappingURL=email.spec.js.map