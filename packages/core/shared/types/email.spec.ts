import { Email, InvalidEmailError } from './email';

describe('Email Value Object', () => {
  it('deve aceitar emails válidos', () => {
    const email = new Email('teste@exemplo.com');
    expect(email.value).toBe('teste@exemplo.com');
  });

  it('deve rejeitar emails inválidos', () => {
    expect(() => new Email('invalido')).toThrow(InvalidEmailError);
    expect(() => new Email('foo@bar')).toThrow(InvalidEmailError);
    expect(() => new Email('foo@.com')).toThrow(InvalidEmailError);
    expect(() => new Email('foo@bar.')).toThrow(InvalidEmailError);
  });

  it('deve comparar igualdade corretamente', () => {
    const email1 = new Email('a@b.com');
    const email2 = new Email('a@b.com');
    const email3 = new Email('c@d.com');
    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
}); 