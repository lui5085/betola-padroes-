
# Guia Rápido • Novo Módulo de Domínio

1. **Criar pastas** em `packages/core`:
   ```text
   <modulo>/
     model/
     provider/
     service/
     index.ts
   ```
2. **Model**: entidades com props imutáveis & VOs.
3. **Provider**: interfaces (ex.: `ApostaRepository`). Sem libs.
4. **Service (UseCase)**: classe que estende `UseCase` e implementa `execute()`.
5. Exportar tudo em `index.ts`.
6. **Tests**: criar unitários em `__tests__` no próprio módulo.
7. **Adapter** correspondente\*\* em `packages/adapters/<db|api>/`.
8. Atualizar docs se a decisão alterar regras (criar ADR se for arquitetural).

Checklist PR:

-

