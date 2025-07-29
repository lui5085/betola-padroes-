"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const username_1 = require("./username");
describe('Username', () => {
    describe('validação', () => {
        it('deve aceitar um username válido', () => {
            const validUsername = 'joao123';
            expect(() => new username_1.Username(validUsername)).not.toThrow();
        });
        it('deve aceitar username com hífen', () => {
            const usernameWithHyphen = 'joao-vitor';
            expect(() => new username_1.Username(usernameWithHyphen)).not.toThrow();
        });
        it('deve aceitar username com underscore', () => {
            const usernameWithUnderscore = 'joao_vitor';
            expect(() => new username_1.Username(usernameWithUnderscore)).not.toThrow();
        });
        it('deve aceitar username com números', () => {
            const usernameWithNumbers = 'joao123';
            expect(() => new username_1.Username(usernameWithNumbers)).not.toThrow();
        });
        it('deve aceitar username com letras maiúsculas', () => {
            const usernameWithUpperCase = 'JoaoVitor';
            expect(() => new username_1.Username(usernameWithUpperCase)).not.toThrow();
        });
        it('deve rejeitar username muito curto', () => {
            const shortUsername = 'jo';
            expect(() => new username_1.Username(shortUsername)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username muito longo', () => {
            const longUsername = 'joaovitormesquitadossantos';
            expect(() => new username_1.Username(longUsername)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username com espaços', () => {
            const usernameWithSpaces = 'joao vitor';
            expect(() => new username_1.Username(usernameWithSpaces)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username com caracteres especiais', () => {
            const usernameWithSpecialChars = 'joao@vitor';
            expect(() => new username_1.Username(usernameWithSpecialChars)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username começando com hífen', () => {
            const usernameStartingWithHyphen = '-joao';
            expect(() => new username_1.Username(usernameStartingWithHyphen)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username terminando com hífen', () => {
            const usernameEndingWithHyphen = 'joao-';
            expect(() => new username_1.Username(usernameEndingWithHyphen)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username começando com underscore', () => {
            const usernameStartingWithUnderscore = '_joao';
            expect(() => new username_1.Username(usernameStartingWithUnderscore)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username terminando com underscore', () => {
            const usernameEndingWithUnderscore = 'joao_';
            expect(() => new username_1.Username(usernameEndingWithUnderscore)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username com hífens consecutivos', () => {
            const usernameWithConsecutiveHyphens = 'joao--vitor';
            expect(() => new username_1.Username(usernameWithConsecutiveHyphens)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username com underscores consecutivos', () => {
            const usernameWithConsecutiveUnderscores = 'joao__vitor';
            expect(() => new username_1.Username(usernameWithConsecutiveUnderscores)).toThrow(username_1.InvalidUsernameError);
        });
        it('deve rejeitar username vazio', () => {
            expect(() => new username_1.Username('')).toThrow(username_1.InvalidUsernameError);
        });
    });
    describe('métodos', () => {
        it('deve retornar o valor do username', () => {
            const usernameValue = 'joao123';
            const username = new username_1.Username(usernameValue);
            expect(username.value).toBe(usernameValue);
        });
        it('deve comparar usernames corretamente', () => {
            const username1 = new username_1.Username('joao123');
            const username2 = new username_1.Username('joao123');
            const username3 = new username_1.Username('maria456');
            expect(username1.equals(username2)).toBe(true);
            expect(username1.equals(username3)).toBe(false);
        });
        it('deve retornar o comprimento correto', () => {
            const username = new username_1.Username('joao123');
            expect(username.length).toBe(7);
        });
        it('deve verificar se o username é longo', () => {
            const shortUsername = new username_1.Username('joao123');
            const longUsername = new username_1.Username('joaovitormesquita');
            expect(shortUsername.isLong()).toBe(false);
            expect(longUsername.isLong()).toBe(true);
        });
        it('deve retornar o username em lowercase', () => {
            const username = new username_1.Username('JoAo123');
            expect(username.toLowerCase()).toBe('joao123');
        });
    });
    describe('método estático isValid', () => {
        it('deve retornar true para username válido', () => {
            expect(username_1.Username.isValid('joao123')).toBe(true);
        });
        it('deve retornar false para username inválido', () => {
            expect(username_1.Username.isValid('jo')).toBe(false);
            expect(username_1.Username.isValid('joaovitormesquitadossantos')).toBe(false);
            expect(username_1.Username.isValid('joao@vitor')).toBe(false);
            expect(username_1.Username.isValid('')).toBe(false);
        });
    });
    describe('casos especiais', () => {
        it('deve aceitar username com combinação de caracteres válidos', () => {
            const validCombinations = [
                'joao123',
                'joao-vitor',
                'joao_vitor',
                'JoaoVitor123',
                'user-name_123'
            ];
            validCombinations.forEach(username => {
                expect(() => new username_1.Username(username)).not.toThrow();
            });
        });
        it('deve rejeitar username com caracteres inválidos', () => {
            const invalidCombinations = [
                'joao@vitor',
                'joao#vitor',
                'joao$vitor',
                'joao%vitor',
                'joao&vitor',
                'joao*vitor',
                'joao+vitor',
                'joao=vitor'
            ];
            invalidCombinations.forEach(username => {
                expect(() => new username_1.Username(username)).toThrow(username_1.InvalidUsernameError);
            });
        });
    });
});
//# sourceMappingURL=username.spec.js.map