# Plano de Implementação — Padrões de Projeto (3ª Entrega)

**Projeto:** Betola  
**Disciplinas:** Reutilização de Software (CKP8500) / Padrões de Projeto de Software (CK0224)  
**Equipe:** Caio Macêdo, Luís Andrade e Enzo Abreu  
**Data do plano:** 2026-05-25  
**Status:** ✅ Todos os 4 padrões implementados

---

## Contexto

A 2ª entrega descreveu 6 padrões. Dois já estavam implementados no projeto original:
- **Strategy** — `IHasher`, `IAuthenticator`, `IEmailSender` em `packages/core/src/auth/services/`
- **Repository** — `IUsersRepository`, `IProfilesRepository` e repositórios dos demais módulos

Quatro foram implementados pela equipe na 3ª entrega:
- ✅ **Factory Pattern** — `BetFactory` para criação de apostas
- ✅ **Decorator Pattern** — Logging e limite diário no `PlaceBetUseCase`
- ✅ **Observer Pattern** — Sistema de eventos de domínio (EventBus)
- ✅ **Chain of Responsibility** — Cadeia de validação para apostas

---

## Padrão 1: Factory Pattern (GoF — Criacional)

**Intenção:** Encapsular a criação de apostas simples e múltiplas em uma `BetFactory`, sem expor `new Bet(...)` diretamente ao código cliente (`PlaceBetUseCase`).

### Arquivos criados

```
packages/core/src/modules/betting/domain/
├── entities/
│   ├── single-bet.ts
│   └── multiple-bet.ts
└── factories/
    └── bet-factory.ts
```

### Arquivos modificados

| Arquivo | Alteração |
|---|---|
| `packages/core/src/modules/betting/domain/entities/bet.ts` | `Bet` tornou-se classe abstrata com getter `type` abstrato |
| `packages/core/src/modules/betting/application/use-cases/place-bet.ts` | `new Bet(...)` substituído por `BetFactory.create(...)` |

### Implementação

**`bet.ts` — Classe base abstrata:**
```typescript
export abstract class Bet extends BaseEntity<BetId> {
  abstract get type(): 'SINGLE' | 'MULTIPLE';
  // ... propriedades e métodos comuns
}
```

**`single-bet.ts` — Aposta simples (1 seleção):**
```typescript
export class SingleBet extends Bet {
  constructor(props: BetProps) {
    if (props.selections.length !== 1) {
      throw new Error('SingleBet must have exactly one selection');
    }
    super(props);
  }
  get type(): 'SINGLE' { return 'SINGLE'; }
}
```

**`multiple-bet.ts` — Aposta múltipla (2+ seleções):**
```typescript
export class MultipleBet extends Bet {
  constructor(props: BetProps) {
    if (props.selections.length < 2) {
      throw new Error('MultipleBet must have at least two selections');
    }
    super(props);
  }
  get type(): 'MULTIPLE' { return 'MULTIPLE'; }
}
```

**`bet-factory.ts` — Factory que decide qual instanciar:**
```typescript
export class BetFactory {
  static create(props: BetProps): Bet {
    if (props.selections.length === 1) {
      return new SingleBet(props);
    }
    return new MultipleBet(props);
  }
}
```

**Uso no `PlaceBetUseCase`:**
```typescript
// Antes: new Bet({ id: betId, userId, selections, amount: betAmount });
// Depois:
const bet = BetFactory.create({ id: betId, userId, selections, amount: betAmount });
```

### Checklist
- [x] Tornar `Bet` abstrata e adicionar getter `type`
- [x] Criar `single-bet.ts`
- [x] Criar `multiple-bet.ts`
- [x] Criar `bet-factory.ts`
- [x] Atualizar `place-bet.ts` para usar `BetFactory.create(...)`
- [x] Verificar que TypeScript compila sem erros

---

## Padrão 2: Decorator Pattern (GoF — Estrutural)

**Intenção:** Adicionar comportamentos ao `PlaceBetUseCase` (logging e limite diário de apostas) de forma dinâmica, sem modificar a implementação original, usando a interface `UseCase<PlaceBetRequest, PlaceBetResponse>`.

### Arquivos criados

```
packages/core/src/modules/betting/application/decorators/
├── place-bet-decorator.ts               (base abstrata)
├── logging-place-bet-decorator.ts       (loga tentativas e resultados)
└── daily-limit-place-bet-decorator.ts   (limita 10 apostas/dia)
```

### Arquivos modificados

| Arquivo | Alteração |
|---|---|
| `packages/core/src/modules/betting/domain/repositories/bets-repository.ts` | Adicionado `countByUserSince` à interface |
| `packages/adapters/src/betting/persistence/prisma-bets-repository.ts` | Implementação de `countByUserSince` |
| `apps/api/src/modules/betting/betting.module.ts` | Composição dos decorators na injeção de dependência |

### Implementação

**`place-bet-decorator.ts` — Base abstrata:**
```typescript
export abstract class PlaceBetDecorator implements UseCase<PlaceBetRequest, PlaceBetResponse> {
  constructor(protected readonly wrapped: UseCase<PlaceBetRequest, PlaceBetResponse>) {}
  abstract execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>>;
}
```

**`logging-place-bet-decorator.ts` — Loga tentativas:**
```typescript
export class LoggingPlaceBetDecorator extends PlaceBetDecorator {
  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    console.log(`[BetLog] User ${request.userId} attempting bet of ${request.amount} betoletas`);
    const result = await this.wrapped.execute(request);
    if (result.isSuccess()) {
      console.log(`[BetLog] Bet placed: id=${result.value.betId} totalOdds=${result.value.totalOdds}`);
    } else {
      console.warn(`[BetLog] Bet failed: ${result.error}`);
    }
    return result;
  }
}
```

**`daily-limit-place-bet-decorator.ts` — Limita apostas por dia:**
```typescript
export class DailyLimitPlaceBetDecorator extends PlaceBetDecorator {
  private static readonly MAX_BETS_PER_DAY = 10;

  constructor(wrapped: UseCase<PlaceBetRequest, PlaceBetResponse>, private readonly betsRepository: BetsRepository) {
    super(wrapped);
  }

  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    const dailyCount = await this.betsRepository.countByUserSince(userId, today);
    if (dailyCount >= 10) {
      return Result.failure('Daily bet limit reached');
    }
    return this.wrapped.execute(request);
  }
}
```

**Composição no módulo NestJS (`betting.module.ts`):**
```typescript
// Decorator Pattern: envolve o use case com logging e limite diário
return new DailyLimitPlaceBetDecorator(
  new LoggingPlaceBetDecorator(transactionalUseCase),
  betsRepo,
);
```

> Fluxo: `DailyLimitDecorator` → `LoggingDecorator` → `PlaceBetUseCase`

### Checklist
- [x] Criar `place-bet-decorator.ts` (base abstrata)
- [x] Criar `logging-place-bet-decorator.ts`
- [x] Criar `daily-limit-place-bet-decorator.ts`
- [x] Adicionar `countByUserSince` à interface `BetsRepository`
- [x] Implementar `countByUserSince` no adapter Prisma
- [x] Compor decorators no módulo NestJS
- [x] Verificar que TypeScript compila sem erros

---

## Padrão 3: Observer Pattern (GoF — Comportamental)

**Intenção:** Definir uma dependência um-para-muitos entre objetos, de modo que quando um objeto (Subject) muda de estado, todos os seus dependentes (Observers) são notificados automaticamente.

**Aplicação no Betola:** Sistema de eventos de domínio (`EventBus`) que notifica observers quando apostas são criadas ou liquidadas. Desacopla a lógica principal (criar/liquidar aposta) da lógica secundária (notificar usuário, atualizar ranking).

### Arquivos criados

```
packages/core/src/shared/domain/events/
├── domain-event.ts                    (interface base)
├── event-bus.ts                       (interface do barramento)
├── domain-events.ts                   (BetPlacedEvent, BetSettledEvent)
└── observers/
    ├── event-observer.ts              (interface do observer)
    ├── notification-observer.ts       (notifica usuário)
    └── league-stats-observer.ts       (atualiza ranking da liga)

packages/adapters/src/events/
└── in-memory-event-bus.ts             (implementação do EventBus)
```

### Arquivos modificados

| Arquivo | Alteração |
|---|---|
| `packages/core/src/modules/betting/application/use-cases/place-bet.ts` | Emite `BetPlacedEvent` após aposta criada |

### Implementação

**`domain-event.ts` — Interface base de evento:**
```typescript
export interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
  readonly payload: Record<string, any>;
}
```

**`event-bus.ts` — Interface do barramento:**
```typescript
export interface EventBus {
  publish(event: DomainEvent): void;
  subscribe(eventType: string, observer: EventObserver): void;
  unsubscribe(eventType: string, observer: EventObserver): void;
}
```

**`domain-events.ts` — Eventos concretos:**
```typescript
export class BetPlacedEvent implements DomainEvent {
  readonly type = 'BET_PLACED';
  readonly timestamp = new Date();
  constructor(public readonly payload: {
    betId: string; userId: string; amount: number;
    totalOdds: number; potentialWin: number; selectionsCount: number;
  }) {}
}

export class BetSettledEvent implements DomainEvent {
  readonly type = 'BET_SETTLED';
  readonly timestamp = new Date();
  constructor(public readonly payload: {
    betId: string; userId: string; isWon: boolean;
    amount: number; potentialWin: number;
  }) {}
}
```

**`event-observer.ts` — Interface do observer:**
```typescript
export interface EventObserver {
  handle(event: DomainEvent): Promise<void>;
}
```

**`notification-observer.ts` — Cria notificações ao liquidar aposta:**
```typescript
export class NotificationObserver implements EventObserver {
  constructor(private readonly createNotification: (...) => Promise<void>) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.type === 'BET_SETTLED') {
      const { userId, isWon, amount, potentialWin } = event.payload;
      await this.createNotification({
        userId,
        type: isWon ? 'BET_WON' : 'BET_LOST',
        title: isWon ? '🎉 Aposta Ganha!' : '😞 Aposta Perdida',
        message: isWon ? `Ganhou ${potentialWin} betoletas!` : `Perdeu ${amount} betoletas.`,
      });
    }
  }
}
```

**`league-stats-observer.ts` — Atualiza ranking da liga:**
```typescript
export class LeagueStatsObserver implements EventObserver {
  constructor(private readonly updateMemberStats: (...) => Promise<void>) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.type === 'BET_SETTLED') {
      const { userId, isWon, amount } = event.payload;
      await this.updateMemberStats(userId, isWon, amount);
    }
  }
}
```

**`in-memory-event-bus.ts` — Implementação:**
```typescript
export class InMemoryEventBus implements EventBus {
  private observers: Map<string, EventObserver[]> = new Map();

  subscribe(eventType: string, observer: EventObserver): void { /* ... */ }
  unsubscribe(eventType: string, observer: EventObserver): void { /* ... */ }

  publish(event: DomainEvent): void {
    const observers = this.observers.get(event.type) || [];
    for (const observer of observers) {
      observer.handle(event).catch(err => console.error(`[EventBus] Error:`, err));
    }
  }
}
```

**Emissão no `PlaceBetUseCase`:**
```typescript
// Observer Pattern: emit domain event
if (this.eventBus) {
  this.eventBus.publish(new BetPlacedEvent({
    betId: bet.id.value,
    userId: request.userId,
    amount: request.amount,
    totalOdds: bet.totalOdds.value,
    potentialWin: bet.potentialWin,
    selectionsCount: request.selections.length,
  }));
}
```

### Checklist
- [x] Criar interface `DomainEvent` (type, timestamp, payload)
- [x] Criar interface `EventBus` (publish, subscribe)
- [x] Criar interface `EventObserver` (handle)
- [x] Criar eventos concretos: `BetPlacedEvent`, `BetSettledEvent`
- [x] Criar `NotificationObserver` (escuta BetSettled → cria notificação)
- [x] Criar `LeagueStatsObserver` (escuta BetSettled → atualiza ranking)
- [x] Criar `InMemoryEventBus` (implementação do EventBus)
- [x] Emitir `BetPlacedEvent` no `PlaceBetUseCase` após criar aposta
- [x] Verificar que TypeScript compila sem erros

---

## Padrão 4: Chain of Responsibility (GoF — Comportamental)

**Intenção:** Evitar o acoplamento do remetente de uma requisição ao seu receptor, dando a mais de um objeto a chance de tratar a requisição. Os objetos receptores são encadeados e a requisição é passada ao longo da cadeia até que um deles a trate (ou rejeite).

**Aplicação no Betola:** Cadeia de validação para apostas onde cada handler verifica uma condição específica. Se qualquer validação falha, a cadeia para e retorna o erro. Substitui múltiplos `if/else` no `PlaceBetUseCase`.

### Arquivos criados

```
packages/core/src/modules/betting/application/validators/
├── bet-validation-handler.ts                  (classe abstrata base)
├── balance-validation-handler.ts              (verifica saldo)
├── match-availability-validation-handler.ts   (verifica se partida é futura)
├── market-active-validation-handler.ts        (verifica odds/mercado válido)
└── bet-validation-chain.ts                    (monta a cadeia)
```

### Arquivos modificados

| Arquivo | Alteração |
|---|---|
| `packages/core/src/modules/betting/application/use-cases/place-bet.ts` | Validações inline substituídas pela cadeia |

### Implementação

**`bet-validation-handler.ts` — Classe abstrata (handler base):**
```typescript
export interface BetValidationContext {
  userId: string;
  amount: number;
  selections: { matchId: string; marketType: string; selection: string; odds: number; }[];
}

export abstract class BetValidationHandler {
  private nextHandler: BetValidationHandler | null = null;

  setNext(handler: BetValidationHandler): BetValidationHandler {
    this.nextHandler = handler;
    return handler; // permite encadear: a.setNext(b).setNext(c)
  }

  async handle(context: BetValidationContext): Promise<Result<void>> {
    const result = await this.validate(context);
    if (result.isFailure()) return result;          // para a cadeia
    if (this.nextHandler) return this.nextHandler.handle(context);  // passa adiante
    return Result.success(undefined);               // fim da cadeia
  }

  protected abstract validate(context: BetValidationContext): Promise<Result<void>>;
}
```

**`balance-validation-handler.ts` — Verifica saldo:**
```typescript
export class BalanceValidationHandler extends BetValidationHandler {
  constructor(private readonly walletsRepository: WalletsRepository) { super(); }

  protected async validate(context: BetValidationContext): Promise<Result<void>> {
    const wallet = await this.walletsRepository.findByUserId(UserId.fromString(context.userId));
    if (!wallet || !wallet.canAfford(new BetAmount(context.amount))) {
      return Result.failure('Insufficient balance');
    }
    return Result.success(undefined);
  }
}
```

**`match-availability-validation-handler.ts` — Verifica partidas:**
```typescript
export class MatchAvailabilityValidationHandler extends BetValidationHandler {
  constructor(private readonly matchesRepository: MatchesRepository) { super(); }

  protected async validate(context: BetValidationContext): Promise<Result<void>> {
    for (const selection of context.selections) {
      const match = await this.matchesRepository.findById(MatchId.fromString(selection.matchId));
      if (!match) return Result.failure(`Match ${selection.matchId} not found`);
      if (new Date(match.kickoffTime.value) <= new Date()) {
        return Result.failure(`Match ${selection.matchId} has already started`);
      }
    }
    return Result.success(undefined);
  }
}
```

**`market-active-validation-handler.ts` — Verifica odds/mercado:**
```typescript
export class MarketActiveValidationHandler extends BetValidationHandler {
  protected async validate(context: BetValidationContext): Promise<Result<void>> {
    for (const selection of context.selections) {
      if (!selection.odds || selection.odds < 1.01) {
        return Result.failure(`Invalid odds: must be at least 1.01`);
      }
      if (!selection.marketType || !selection.selection) {
        return Result.failure(`Invalid market data`);
      }
    }
    return Result.success(undefined);
  }
}
```

**`bet-validation-chain.ts` — Monta a cadeia:**
```typescript
export class BetValidationChain {
  private firstHandler: BetValidationHandler;

  constructor(walletsRepository: WalletsRepository, matchesRepository: MatchesRepository) {
    const balanceHandler = new BalanceValidationHandler(walletsRepository);
    const matchHandler = new MatchAvailabilityValidationHandler(matchesRepository);
    const marketHandler = new MarketActiveValidationHandler();

    // Cadeia: Balance → Match → Market
    balanceHandler.setNext(matchHandler).setNext(marketHandler);
    this.firstHandler = balanceHandler;
  }

  async validate(context: BetValidationContext): Promise<Result<void>> {
    return this.firstHandler.handle(context);
  }
}
```

**Uso no `PlaceBetUseCase`:**
```typescript
// Chain of Responsibility: validate bet through the chain
const validationChain = new BetValidationChain(this.walletsRepository, this.matchesRepository);
const validationResult = await validationChain.validate({
  userId: request.userId,
  amount: request.amount,
  selections: request.selections,
});

if (validationResult.isFailure()) {
  return Result.failure(validationResult.error);
}
```

### Checklist
- [x] Criar classe abstrata `BetValidationHandler` (setNext, handle)
- [x] Criar `BalanceValidationHandler` (verifica wallet.canAfford)
- [x] Criar `MatchAvailabilityValidationHandler` (verifica se match existe e é futuro)
- [x] Criar `MarketActiveValidationHandler` (verifica se mercado está ativo)
- [x] Criar `BetValidationChain` (factory que monta a cadeia na ordem correta)
- [x] Atualizar `PlaceBetUseCase` para usar a cadeia em vez de `if` inline
- [x] Verificar que TypeScript compila sem erros

---

## Resumo do impacto

| Padrão | Tipo | Arquivos novos | Arquivos modificados | Complexidade |
|---|---|---|---|---|
| Factory | Criacional | 3 | 2 | Baixa |
| Decorator | Estrutural | 3 | 3 | Baixa-média |
| Observer | Comportamental | 7 | 1 | Média |
| Chain of Responsibility | Comportamental | 5 | 1 | Baixa-média |
| **Total** | — | **18** | **7** | — |

---

## Diagrama de interação no `PlaceBetUseCase`

```
Requisição de aposta
        │
        ▼
┌─────────────────────────────────┐
│  DailyLimitPlaceBetDecorator    │ ← Decorator Pattern
│  (verifica limite diário)       │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  LoggingPlaceBetDecorator       │ ← Decorator Pattern
│  (loga tentativa)               │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  PlaceBetUseCase.execute()      │
│                                 │
│  1. BetValidationChain          │ ← Chain of Responsibility
│     Balance → Match → Market    │
│                                 │
│  2. BetFactory.create(props)    │ ← Factory Pattern
│     → SingleBet ou MultipleBet  │
│                                 │
│  3. eventBus.publish(event)     │ ← Observer Pattern
│     → NotificationObserver      │
│     → LeagueStatsObserver       │
└─────────────────────────────────┘
```
