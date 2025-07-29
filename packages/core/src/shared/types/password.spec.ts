// packages/core/shared/types/password.spec.ts

import { Password, InvalidPasswordError } from './password';

describe('Password', () => {
  describe('validação', () => {
    it('deve aceitar uma senha válida', () => {
      const validPassword = 'Senha123!';
      expect(() => new Password(validPassword)).not.toThrow();
    });

    it('deve rejeitar senha muito curta', () => {
      const shortPassword = 'Abc1!';
      expect(() => new Password(shortPassword)).toThrow(InvalidPasswordError);
    });

    it('deve rejeitar senha sem letra maiúscula', () => {
      const noUpperCase = 'senha123!';
      expect(() => new Password(noUpperCase)).toThrow(InvalidPasswordError);
    });

    it('deve rejeitar senha sem letra minúscula', () => {
      const noLowerCase = 'SENHA123!';
      expect(() => new Password(noLowerCase)).toThrow(InvalidPasswordError);
    });

    it('deve rejeitar senha sem número', () => {
      const noNumber = 'SenhaTest!';
      expect(() => new Password(noNumber)).toThrow(InvalidPasswordError);
    });

    it('deve rejeitar senha sem caractere especial', () => {
      const noSpecialChar = 'Senha123';
      expect(() => new Password(noSpecialChar)).toThrow(InvalidPasswordError);
    });

    it('deve rejeitar senha vazia', () => {
      expect(() => new Password('')).toThrow(InvalidPasswordError);
    });
  });

  describe('métodos', () => {
    it('deve retornar o valor da senha', () => {
      const passwordValue = 'Senha123!';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });

    it('deve comparar senhas corretamente', () => {
      const password1 = new Password('Senha123!');
      const password2 = new Password('Senha123!');
      const password3 = new Password('Outra123!');

      expect(password1.equals(password2)).toBe(true);
      expect(password1.equals(password3)).toBe(false);
    });

    it('deve verificar se a senha é forte', () => {
      const weakPassword = new Password('Senha123!'); // 10 caracteres
      const strongPassword = new Password('SenhaMuitoForte123!'); // 20 caracteres

      expect(weakPassword.isStrong()).toBe(false);
      expect(strongPassword.isStrong()).toBe(true);
    });

    it('deve retornar o comprimento correto', () => {
      const password = new Password('Senha123!');
      expect(password.length).toBe(9);
    });
  });

  describe('método estático isValid', () => {
    it('deve retornar true para senha válida', () => {
      expect(Password.isValid('Senha123!')).toBe(true);
    });

    it('deve retornar false para senha inválida', () => {
      expect(Password.isValid('senha')).toBe(false);
      expect(Password.isValid('123456')).toBe(false);
      expect(Password.isValid('')).toBe(false);
    });
  });

  describe('casos especiais', () => {
    it('deve aceitar senhas com diferentes caracteres especiais', () => {
      const specialChars = ['Senha123!', 'Senha123@', 'Senha123#', 'Senha123$', 'Senha123%'];
      specialChars.forEach(password => {
        expect(() => new Password(password)).not.toThrow();
      });
    });

    it('deve aceitar senhas com espaços (se válidas)', () => {
      const passwordWithSpace = 'Senha 123!';
      expect(() => new Password(passwordWithSpace)).not.toThrow();
    });
  });
}); 