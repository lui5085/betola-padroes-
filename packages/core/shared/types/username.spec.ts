// packages/core/shared/types/username.spec.ts

import { Username, InvalidUsernameError } from './username';

describe('Username', () => {
  describe('validação', () => {
    it('deve aceitar um username válido', () => {
      const validUsername = 'joao123';
      expect(() => new Username(validUsername)).not.toThrow();
    });

    it('deve aceitar username com hífen', () => {
      const usernameWithHyphen = 'joao-vitor';
      expect(() => new Username(usernameWithHyphen)).not.toThrow();
    });

    it('deve aceitar username com underscore', () => {
      const usernameWithUnderscore = 'joao_vitor';
      expect(() => new Username(usernameWithUnderscore)).not.toThrow();
    });

    it('deve aceitar username com números', () => {
      const usernameWithNumbers = 'joao123';
      expect(() => new Username(usernameWithNumbers)).not.toThrow();
    });

    it('deve aceitar username com letras maiúsculas', () => {
      const usernameWithUpperCase = 'JoaoVitor';
      expect(() => new Username(usernameWithUpperCase)).not.toThrow();
    });

    it('deve rejeitar username muito curto', () => {
      const shortUsername = 'jo';
      expect(() => new Username(shortUsername)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username muito longo', () => {
      const longUsername = 'joaovitormesquitadossantos';
      expect(() => new Username(longUsername)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username com espaços', () => {
      const usernameWithSpaces = 'joao vitor';
      expect(() => new Username(usernameWithSpaces)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username com caracteres especiais', () => {
      const usernameWithSpecialChars = 'joao@vitor';
      expect(() => new Username(usernameWithSpecialChars)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username começando com hífen', () => {
      const usernameStartingWithHyphen = '-joao';
      expect(() => new Username(usernameStartingWithHyphen)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username terminando com hífen', () => {
      const usernameEndingWithHyphen = 'joao-';
      expect(() => new Username(usernameEndingWithHyphen)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username começando com underscore', () => {
      const usernameStartingWithUnderscore = '_joao';
      expect(() => new Username(usernameStartingWithUnderscore)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username terminando com underscore', () => {
      const usernameEndingWithUnderscore = 'joao_';
      expect(() => new Username(usernameEndingWithUnderscore)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username com hífens consecutivos', () => {
      const usernameWithConsecutiveHyphens = 'joao--vitor';
      expect(() => new Username(usernameWithConsecutiveHyphens)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username com underscores consecutivos', () => {
      const usernameWithConsecutiveUnderscores = 'joao__vitor';
      expect(() => new Username(usernameWithConsecutiveUnderscores)).toThrow(InvalidUsernameError);
    });

    it('deve rejeitar username vazio', () => {
      expect(() => new Username('')).toThrow(InvalidUsernameError);
    });
  });

  describe('métodos', () => {
    it('deve retornar o valor do username', () => {
      const usernameValue = 'joao123';
      const username = new Username(usernameValue);
      expect(username.value).toBe(usernameValue);
    });

    it('deve comparar usernames corretamente', () => {
      const username1 = new Username('joao123');
      const username2 = new Username('joao123');
      const username3 = new Username('maria456');

      expect(username1.equals(username2)).toBe(true);
      expect(username1.equals(username3)).toBe(false);
    });

    it('deve retornar o comprimento correto', () => {
      const username = new Username('joao123');
      expect(username.length).toBe(7);
    });

    it('deve verificar se o username é longo', () => {
      const shortUsername = new Username('joao123'); // 7 caracteres
      const longUsername = new Username('joaovitormesquita'); // 16 caracteres

      expect(shortUsername.isLong()).toBe(false);
      expect(longUsername.isLong()).toBe(true);
    });

    it('deve retornar o username em lowercase', () => {
      const username = new Username('JoAo123');
      expect(username.toLowerCase()).toBe('joao123');
    });
  });

  describe('método estático isValid', () => {
    it('deve retornar true para username válido', () => {
      expect(Username.isValid('joao123')).toBe(true);
    });

    it('deve retornar false para username inválido', () => {
      expect(Username.isValid('jo')).toBe(false); // muito curto
      expect(Username.isValid('joaovitormesquitadossantos')).toBe(false); // muito longo
      expect(Username.isValid('joao@vitor')).toBe(false); // caractere especial
      expect(Username.isValid('')).toBe(false); // vazio
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
        expect(() => new Username(username)).not.toThrow();
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
        expect(() => new Username(username)).toThrow(InvalidUsernameError);
      });
    });
  });
}); 