// packages/core/shared/types/user-id.spec.ts

import { UserId, InvalidUserIdError } from './user-id';

describe('UserId', () => {
  it('deve criar um UserId válido (UUID v4)', () => {
    const uuid = '6f1a7e2e-3b2a-4c8e-8e2a-7b2e3c8e2a7b';
    const userId = new UserId(uuid);
    expect(userId.value).toBe(uuid);
  });

  it('deve lançar erro para UserId inválido', () => {
    const invalidUuid = 'not-a-uuid';
    expect(() => new UserId(invalidUuid)).toThrow(InvalidUserIdError);
  });

  it('deve comparar igualdade corretamente', () => {
    const uuid = '6f1a7e2e-3b2a-4c8e-8e2a-7b2e3c8e2a7b';
    const userId1 = new UserId(uuid);
    const userId2 = new UserId(uuid);
    expect(userId1.equals(userId2)).toBe(true);
  });

  it('deve diferenciar UserIds diferentes', () => {
    const uuid1 = '6f1a7e2e-3b2a-4c8e-8e2a-7b2e3c8e2a7b';
    const uuid2 = '7e2a7b2e-8e2a-4c8e-9b2e-6f1a7e2e3b2a';
    const userId1 = new UserId(uuid1);
    const userId2 = new UserId(uuid2);
    expect(userId1.equals(userId2)).toBe(false);
  });
}); 