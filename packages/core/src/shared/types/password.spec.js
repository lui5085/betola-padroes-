"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const password_1 = require("./password");
describe('Password', () => {
    describe('validação', () => {
        it('deve aceitar uma senha válida', () => {
            const validPassword = 'Senha123!';
            expect(() => new password_1.Password(validPassword)).not.toThrow();
        });
        it('deve rejeitar senha muito curta', () => {
            const shortPassword = 'Abc1!';
            expect(() => new password_1.Password(shortPassword)).toThrow(password_1.InvalidPasswordError);
        });
        it('deve rejeitar senha sem letra maiúscula', () => {
            const noUpperCase = 'senha123!';
            expect(() => new password_1.Password(noUpperCase)).toThrow(password_1.InvalidPasswordError);
        });
        it('deve rejeitar senha sem letra minúscula', () => {
            const noLowerCase = 'SENHA123!';
            expect(() => new password_1.Password(noLowerCase)).toThrow(password_1.InvalidPasswordError);
        });
        it('deve rejeitar senha sem número', () => {
            const noNumber = 'SenhaTest!';
            expect(() => new password_1.Password(noNumber)).toThrow(password_1.InvalidPasswordError);
        });
        it('deve rejeitar senha sem caractere especial', () => {
            const noSpecialChar = 'Senha123';
            expect(() => new password_1.Password(noSpecialChar)).toThrow(password_1.InvalidPasswordError);
        });
        it('deve rejeitar senha vazia', () => {
            expect(() => new password_1.Password('')).toThrow(password_1.InvalidPasswordError);
        });
    });
    describe('métodos', () => {
        it('deve retornar o valor da senha', () => {
            const passwordValue = 'Senha123!';
            const password = new password_1.Password(passwordValue);
            expect(password.value).toBe(passwordValue);
        });
        it('deve comparar senhas corretamente', () => {
            const password1 = new password_1.Password('Senha123!');
            const password2 = new password_1.Password('Senha123!');
            const password3 = new password_1.Password('Outra123!');
            expect(password1.equals(password2)).toBe(true);
            expect(password1.equals(password3)).toBe(false);
        });
        it('deve verificar se a senha é forte', () => {
            const weakPassword = new password_1.Password('Senha123!');
            const strongPassword = new password_1.Password('SenhaMuitoForte123!');
            expect(weakPassword.isStrong()).toBe(false);
            expect(strongPassword.isStrong()).toBe(true);
        });
        it('deve retornar o comprimento correto', () => {
            const password = new password_1.Password('Senha123!');
            expect(password.length).toBe(9);
        });
    });
    describe('método estático isValid', () => {
        it('deve retornar true para senha válida', () => {
            expect(password_1.Password.isValid('Senha123!')).toBe(true);
        });
        it('deve retornar false para senha inválida', () => {
            expect(password_1.Password.isValid('senha')).toBe(false);
            expect(password_1.Password.isValid('123456')).toBe(false);
            expect(password_1.Password.isValid('')).toBe(false);
        });
    });
    describe('casos especiais', () => {
        it('deve aceitar senhas com diferentes caracteres especiais', () => {
            const specialChars = ['Senha123!', 'Senha123@', 'Senha123#', 'Senha123$', 'Senha123%'];
            specialChars.forEach(password => {
                expect(() => new password_1.Password(password)).not.toThrow();
            });
        });
        it('deve aceitar senhas com espaços (se válidas)', () => {
            const passwordWithSpace = 'Senha 123!';
            expect(() => new password_1.Password(passwordWithSpace)).not.toThrow();
        });
    });
});
//# sourceMappingURL=password.spec.js.map