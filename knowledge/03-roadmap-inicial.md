## Roadmap Inicial – O que fazer agora

1. **Criar skeleton de pastas**  
   - `packages/core/shared` (base + types)  
   - `packages/core/{aposta,usuario,liga,chat}`.
2. **Value Objects comuns**  
   - `uuid.ts`, `email.ts`, `money.ts`, `timestamp.ts` em `shared/types`.
3. **Contratos base**  
   - `UseCase`, `Entity`, `Props`, `Result` em `shared/base`.
4. **Módulos iniciais** (aposta, usuario, liga, chat):  
   - `model/` entidades  
   - `provider/` interfaces  
   - `service/` casos de uso mínimos (Ex.: `CriarAposta`, `LogarUsuario`).
5. **Adapter Postgres**  
   - `packages/adapters/db` com repositórios Prisma.
6. **API Nest**  
   - Registrar providers e injetar adapters nos controllers.
7. **Gateway de odds externas**  
   - `packages/adapters/external-api/oddsGateway.ts` + DTOs.
8. **Export clean**  
   - `index.ts` em cada módulo e no shared.
9. **Testes automáticos**  
   - Unitários no `core` + integração na API.
10. **Atualizar documentação**  
    - `README.md` e arquivos em `knowledge/`.

> **Dica:** cada tarefa ==> commit/pull‑request separado.

