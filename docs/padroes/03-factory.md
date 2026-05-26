# Factory Pattern

## O que é

O Factory é um padrão criacional (GoF) que encapsula a lógica de criação de objetos em um método ou classe dedicada. O código cliente não precisa saber qual classe concreta está sendo instanciada — ele chama a factory e recebe o objeto pronto.

## Problema que resolve

Quando a criação de um objeto depende de condições (ex: tipo de aposta), usar `new` diretamente espalha essa lógica pelo código. A Factory centraliza a decisão de qual classe instanciar.

## Estrutura

```
┌──────────────┐         ┌─────────────┐
│  PlaceBetUse │────────▶│  BetFactory  │
│  Case        │         └─────────────┘
└──────────────┘                │
                                │ create(props)
                                ▼
                    ┌───────────────────────┐
                    │     Bet (abstrata)     │
                    └───────────────────────┘
                         ▲            ▲
                         │            │
                  ┌───────────┐ ┌────────────┐
                  │ SingleBet │ │MultipleBet │
                  └───────────┘ └────────────┘
```

## Onde está no Betola

```
packages/core/src/modules/betting/domain/
├── entities/
│   ├── bet.ts              → Bet (classe base abstrata)
│   ├── single-bet.ts       → SingleBet (1 seleção)
│   └── multiple-bet.ts     → MultipleBet (2+ seleções)
└── factories/
    └── bet-factory.ts      → BetFactory.create(props)
```

## Exemplo de código

```typescript
// Classe base abstrata
export abstract class Bet {
  abstract get type(): 'SINGLE' | 'MULTIPLE';
  // propriedades e métodos comuns...
}

// Subclasse para aposta simples
export class SingleBet extends Bet {
  constructor(props: BetProps) {
    if (props.selections.length !== 1) {
      throw new Error('SingleBet must have exactly one selection');
    }
    super(props);
  }
  get type(): 'SINGLE' { return 'SINGLE'; }
}

// Subclasse para aposta múltipla
export class MultipleBet extends Bet {
  constructor(props: BetProps) {
    if (props.selections.length < 2) {
      throw new Error('MultipleBet must have at least two selections');
    }
    super(props);
  }
  get type(): 'MULTIPLE' { return 'MULTIPLE'; }
}

// Factory — decide qual classe instanciar
export class BetFactory {
  static create(props: BetProps): Bet {
    if (props.selections.length === 1) {
      return new SingleBet(props);
    }
    return new MultipleBet(props);
  }
}

// Uso no caso de uso
const bet = BetFactory.create({ userId, selections, amount });
// Não precisa saber se é SingleBet ou MultipleBet
```

## Benefícios

- Centraliza a lógica de criação em um único ponto
- Adicionar novos tipos de aposta (ex: `SystemBet`) não altera o código cliente
- Validações específicas de cada tipo ficam encapsuladas na subclasse
- Respeita o princípio Open/Closed
