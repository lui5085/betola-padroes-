# Decorator Pattern

## O que é

O Decorator é um padrão estrutural (GoF) que permite adicionar comportamentos a um objeto dinamicamente, envolvendo-o em objetos "decoradores" que implementam a mesma interface. Cada decorador adiciona uma responsabilidade e delega o restante ao objeto interno.

## Problema que resolve

Quando você precisa adicionar funcionalidades (logging, validação, cache, rate limiting) a um caso de uso sem modificar sua implementação original. Herança não funciona bem aqui porque as combinações de comportamentos seriam exponenciais.

## Estrutura

```
┌─────────────────────────────────────────────────────────────┐
│                    Composição final                          │
│                                                             │
│  DailyLimitDecorator                                        │
│    └── LoggingDecorator                                     │
│          └── PlaceBetUseCase (implementação real)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Fluxo de execução:
1. DailyLimitDecorator → verifica se o usuário atingiu o limite diário
2. LoggingDecorator → loga a tentativa de aposta
3. PlaceBetUseCase → executa a lógica real de criar a aposta
```

## Onde está no Betola

```
packages/core/src/modules/betting/application/decorators/
├── place-bet-decorator.ts               → classe base abstrata
├── logging-place-bet-decorator.ts       → loga tentativas e resultados
└── daily-limit-place-bet-decorator.ts   → limita apostas por dia
```

## Exemplo de código

```typescript
// Interface comum (UseCase)
interface UseCase<TReq, TRes> {
  execute(request: TReq): Promise<Result<TRes>>;
}

// Classe base do decorator
export abstract class PlaceBetDecorator implements UseCase<PlaceBetRequest, PlaceBetResponse> {
  constructor(protected readonly wrapped: UseCase<PlaceBetRequest, PlaceBetResponse>) {}
  abstract execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>>;
}

// Decorator concreto: Logging
export class LoggingPlaceBetDecorator extends PlaceBetDecorator {
  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    console.log(`[BetLog] User ${request.userId} attempting bet of ${request.amount}`);
    const result = await this.wrapped.execute(request);
    if (result.isSuccess()) {
      console.log(`[BetLog] Bet placed: id=${result.value.betId}`);
    } else {
      console.warn(`[BetLog] Bet failed: ${result.error}`);
    }
    return result;
  }
}

// Decorator concreto: Limite diário
export class DailyLimitPlaceBetDecorator extends PlaceBetDecorator {
  private static readonly MAX_BETS_PER_DAY = 10;

  constructor(
    wrapped: UseCase<PlaceBetRequest, PlaceBetResponse>,
    private readonly betsRepository: BetsRepository,
  ) {
    super(wrapped);
  }

  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.betsRepository.countByUserSince(request.userId, today);
    
    if (count >= DailyLimitPlaceBetDecorator.MAX_BETS_PER_DAY) {
      return Result.failure('Daily bet limit reached');
    }
    return this.wrapped.execute(request);
  }
}

// Composição (no módulo NestJS)
const placeBet = new DailyLimitPlaceBetDecorator(
  new LoggingPlaceBetDecorator(
    new PlaceBetUseCase(betsRepo, walletsRepo, matchesRepo),
  ),
  betsRepo,
);
```

## Benefícios

- Adicionar/remover comportamentos sem alterar o caso de uso original
- Combinar decorators em qualquer ordem
- Cada decorator tem responsabilidade única (SRP)
- Fácil de testar isoladamente
- Respeita Open/Closed — novos comportamentos = novos decorators, sem tocar no existente
