# Strategy Pattern

## O que é

O Strategy é um padrão comportamental (GoF) que permite definir uma família de algoritmos, encapsular cada um deles em uma classe separada e torná-los intercambiáveis. O cliente que usa o algoritmo não precisa saber qual implementação concreta está sendo utilizada — ele depende apenas da interface.

## Problema que resolve

Quando um sistema precisa suportar múltiplas variações de um comportamento (ex: diferentes formas de hash de senha, diferentes provedores de email), sem usar `if/else` ou `switch` para escolher a implementação.

## Estrutura

```
┌─────────────────┐       ┌──────────────────────┐
│   UseCase        │──────▶│   IHasher (interface) │
│ (RegisterUser)   │       └──────────────────────┘
└─────────────────┘                 ▲
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
             ┌──────────┐   ┌──────────┐   ┌──────────────┐
             │BcryptHash│   │Argon2Hash│   │  ScryptHash  │
             └──────────┘   └──────────┘   └──────────────┘
```

## Onde está no Betola

### Interfaces (contratos)

```
packages/core/src/auth/services/
├── hasher.ts            → IHasher (hash, compare)
├── authenticator.ts     → IAuthenticator (sign, verify)
└── email-sender.ts      → IEmailSender (send)
```

### Implementações concretas

```
packages/adapters/src/auth/services/
├── bcrypt-hasher.ts           → implementa IHasher com bcrypt
├── jwt-authenticator.ts       → implementa IAuthenticator com JWT
└── console-email-sender.ts    → implementa IEmailSender (console para dev)
```

## Exemplo de código

```typescript
// Interface (Strategy)
export interface IHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

// Implementação concreta
export class BcryptHasher implements IHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

// Uso no caso de uso — não sabe qual hasher é
export class RegisterUserUseCase {
  constructor(private hasher: IHasher) {}

  async execute(data) {
    const hashed = await this.hasher.hash(data.password);
    // ...
  }
}
```

## Benefícios

- Trocar a implementação (ex: bcrypt → argon2) sem alterar nenhum caso de uso
- Facilita testes unitários com mocks/stubs
- Respeita o princípio Open/Closed (aberto para extensão, fechado para modificação)
