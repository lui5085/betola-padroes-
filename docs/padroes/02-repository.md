# Repository Pattern

## O que é

O Repository é um padrão que medeia entre a camada de domínio e a camada de dados, agindo como uma coleção em memória de objetos de domínio. O domínio não sabe se os dados vêm de um banco SQL, NoSQL, API externa ou arquivo — ele apenas chama métodos como `findById`, `save`, `delete`.

É descrito por Eric Evans em *Domain-Driven Design* (2003) e amplamente usado em Clean Architecture.

## Problema que resolve

- Desacoplar a lógica de negócio da tecnologia de persistência
- Permitir trocar o banco de dados (ex: PostgreSQL → MongoDB) sem alterar os casos de uso
- Facilitar testes unitários (substituir o repositório real por um in-memory)

## Estrutura

```
┌──────────────────┐       ┌───────────────────────────┐
│   UseCase         │──────▶│  IUsersRepository          │
│ (RegisterUser)    │       │  (interface no core)       │
└──────────────────┘       └───────────────────────────┘
                                       ▲
                                       │
                           ┌───────────────────────────┐
                           │  PrismaUsersRepository     │
                           │  (implementação no adapter)│
                           └───────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   PostgreSQL     │
                              └─────────────────┘
```

## Onde está no Betola

### Interfaces (no core — domínio)

```
packages/core/src/auth/repositories/
├── users-repository.ts       → IUsersRepository
└── profiles-repository.ts    → IProfilesRepository

packages/core/src/modules/betting/domain/repositories/
├── bets-repository.ts        → BetsRepository
└── markets-repository.ts     → MarketsRepository

packages/core/src/modules/matches/domain/repositories/
├── matches-repository.ts     → MatchesRepository
└── teams-repository.ts       → TeamsRepository
```

### Implementações (no adapters — infraestrutura)

```
packages/adapters/src/auth/persistence/
├── prisma-users-repository.ts
├── prisma-profiles-repository.ts
└── prisma.ts

packages/adapters/src/betting/persistence/
├── prisma-bets-repository.ts
└── prisma-markets-repository.ts

packages/adapters/src/matches/
├── prisma-matches-repository.ts
└── prisma-teams-repository.ts (persistence/)
```

## Exemplo de código

```typescript
// Interface no core (domínio)
export interface IUsersRepository {
  create(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Implementação com Prisma (adapter)
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
    });
    if (!user) return null;
    return this.toDomain(user);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.value },
      data: { /* ... */ },
    });
  }
}
```

## Benefícios

- Domínio 100% independente de tecnologia de banco
- Testes unitários rápidos com repositórios in-memory
- Facilita migração de banco (Prisma → TypeORM, SQL → NoSQL)
- Centraliza queries complexas em um único lugar
