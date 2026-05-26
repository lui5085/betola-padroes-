# Padrões de Projeto — Betola

Este diretório documenta os padrões de projeto (Design Patterns) utilizados no Betola, com explicação teórica e localização no código.

## Padrões implementados

| # | Padrão | Tipo | Arquivo principal |
|---|--------|------|-------------------|
| 1 | [Strategy](./01-strategy.md) | Comportamental | `packages/core/src/auth/services/` |
| 2 | [Repository](./02-repository.md) | Estrutural (DDD) | `packages/core/*/repositories/` |
| 3 | [Factory](./03-factory.md) | Criacional | `packages/core/src/modules/betting/domain/factories/` |
| 4 | [Decorator](./04-decorator.md) | Estrutural | `packages/core/src/modules/betting/application/decorators/` |

## Referências

- Gamma, E. et al. *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF, 1994)
- Martin, R. C. *Clean Architecture* (2017)
- Evans, E. *Domain-Driven Design* (2003)
