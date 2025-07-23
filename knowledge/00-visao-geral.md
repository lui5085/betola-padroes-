# Visão Geral

> Fonte de verdade resumida para novos devs e para agentes de IA.

- **Propósito**: Web‑app de apostas de futebol com dinheiro fictício (trabalho de Engenharia de Software).
- **Arquitetura**: Clean Architecture + DDD em monorepo Turborepo.
  - `packages/core` → domínio puro (TS, sem libs externas).
  - `packages/adapters` → implementações que falam com DB, APIs, sockets.
  - `apps/api` (Nest) → orquestra IO, injeta adapters.
  - `apps/web` (Next) → UI, usa provedores via hooks/SDK.
  - Para detalhes do módulo de autenticação/usuário, veja `knowledge/05-auth-modulo.md`.
- **Fluxo de dependência**: *Controller* → **UseCase (core)** → **Provider (interface)** → **Adapter (implementação)**.
- **Regras de ouro**
  1. Nada de lógica de negócio fora de `core`.
  2. Validação vive nos **Value Objects** (`money.ts`, `uuid.ts`…).
  3. Commits pequenos e documentados; docs acompanham PR.

---