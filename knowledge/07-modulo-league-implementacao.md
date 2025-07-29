# Módulo de Ligas - Plano de Implementação

> Plano detalhado para implementação do módulo de ligas seguindo Clean Architecture e boas práticas do projeto.

## 📋 Visão Geral

Implementação do módulo de ligas conforme especificado em `knowledge/06-modulo-league`, seguindo a arquitetura estabelecida no projeto e os padrões do módulo de autenticação.

**Estrutura Base:**
- **Core Domain:** `packages/core/src/league/`
- **Adapters:** `packages/adapters/src/league/`
- **API:** `apps/api/src/league/`
- **UI:** `apps/web/src/app/leagues/`

## 🎯 Fase 1: Core Domain (packages/core/src/league)

### 1.1 Value Objects
```typescript
// packages/core/shared/types/
- league-id.ts          // UUID para identificação única
- title.ts              // 3-50 caracteres, obrigatório
- description.ts        // opcional, máx 255 caracteres
- image-url.ts          // URL opcional para imagem da liga
```

### 1.2 Entidades
```typescript
// packages/core/src/league/entities/
- league.ts             // Entidade principal da liga
- league-participant.ts // Participante de uma liga
- chat-message.ts       // Mensagem do chat da liga
```

### 1.3 Interfaces (Providers)
```typescript
// packages/core/src/league/repositories/
- league-repository.ts
- league-participant-repository.ts

// packages/core/src/league/services/
- league-chat-gateway.ts
```

### 1.4 Use Cases
```typescript
// packages/core/src/league/use-cases/
- create-league-use-case.ts
- join-league-use-case.ts
- leave-league-use-case.ts
- update-league-use-case.ts
- delete-league-use-case.ts
- get-league-use-case.ts
- list-user-leagues-use-case.ts
- list-league-participants-use-case.ts
```

### 1.5 Erros de Domínio
```typescript
// packages/core/src/league/use-cases/errors/
- league-not-found-error.ts
- league-full-error.ts
- user-already-in-league-error.ts
- user-not-in-league-error.ts
- unauthorized-league-operation-error.ts
```

### 1.6 Constantes
```typescript
// packages/core/src/league/constants.ts
export const MAX_LEAGUE_PARTICIPANTS = 100;
export const MIN_TITLE_LENGTH = 3;
export const MAX_TITLE_LENGTH = 50;
export const MAX_DESCRIPTION_LENGTH = 255;
```

### 1.7 Testes Unitários
- [x] Testes para todos os Value Objects
- [x] Testes para todas as entidades
- [x] Testes para todos os Use Cases (completo)
- [x] Testes para erros de domínio

## 🗄️ Fase 2: Database Schema (Prisma)

### 2.1 Modelos no Schema
```prisma
// prisma/schema.prisma
model League {
  id          String   @id @default(cuid())
  title       String
  description String?
  imageUrl    String?
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner       User     @relation(fields: [ownerId], references: [id])
  participants LeagueParticipant[]
  messages    ChatMessage[]

  @@map("leagues")
}

model LeagueParticipant {
  id        String   @id @default(cuid())
  leagueId  String
  userId    String
  joinedAt  DateTime @default(now())

  league    League   @relation(fields: [leagueId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([leagueId, userId])
  @@map("league_participants")
}

model ChatMessage {
  id        String   @id @default(cuid())
  leagueId  String
  userId    String
  message   String
  createdAt DateTime @default(now())

  league    League   @relation(fields: [leagueId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@map("chat_messages")
}
```

### 2.2 Migração
```bash
npx prisma migrate dev --name add_league_models
```

## 🔌 Fase 3: Adapters (packages/adapters)

### 3.1 Persistence Adapters
```typescript
// packages/adapters/src/league/persistence/
- prisma-league-repository.ts
- prisma-league-participant-repository.ts
- prisma-chat-message-repository.ts
```

### 3.2 Services Adapters
```typescript
// packages/adapters/src/league/services/
- websocket-league-chat-gateway.ts
```

## 🚀 Fase 4: API (apps/api)

### 4.1 Controllers
```typescript
// apps/api/src/league/
- league.controller.ts ✅
- league-chat.gateway.ts (pendente)
```

### 4.2 DTOs
```typescript
// apps/api/src/league/dto/
- create-league.dto.ts ✅
- update-league.dto.ts ✅
- join-league.dto.ts (pendente)
- chat-message.dto.ts (pendente)
- league-response.dto.ts ✅
```

### 4.3 Module
```typescript
// apps/api/src/league/
- league.module.ts ✅
```

### 4.4 Endpoints REST
| Método | Rota                        | UseCase           | Descrição                    |
|--------|----------------------------|-------------------|------------------------------|
| POST   | `/leagues`                 | CreateLeague      | Criar nova liga             |
| GET    | `/leagues`                 | ListUserLeagues   | Listar ligas do usuário     |
| GET    | `/leagues/:id`             | GetLeague         | Detalhes da liga            |
| PATCH  | `/leagues/:id`             | UpdateLeague      | Atualizar liga              |
| DELETE | `/leagues/:id`             | DeleteLeague      | Deletar liga                |
| POST   | `/leagues/:id/join`        | JoinLeague        | Entrar na liga              |
| POST   | `/leagues/:id/leave`       | LeaveLeague       | Sair da liga                |
| GET    | `/leagues/:id/participants| ListParticipants  | Listar participantes         |

### 4.5 WebSocket
```typescript
// WebSocket Gateway
- Namespace: `/ws/leagues/:id/chat`
- Events: `send_message`, `join_chat`, `leave_chat`
```

## 🎨 Fase 5: UI (apps/web)

### 5.1 Páginas
```typescript
// apps/web/src/app/leagues/
- page.tsx                    // Lista de ligas
- create/page.tsx             // Criar liga
- [id]/page.tsx              // Detalhes da liga
```

### 5.2 Componentes
```typescript
// apps/web/src/components/league/
- league-card.tsx             // Card da liga
- league-form.tsx             // Formulário de criação/edição
- league-chat.tsx             // Chat da liga
- league-participants.tsx     // Lista de participantes
- league-ranking.tsx          // Ranking da liga
- league-tabs.tsx             // Tabs (Overview/Chat/Ranking)
```

### 5.3 Hooks/Services
```typescript
// apps/web/src/lib/
- league-api.ts               // Cliente API para ligas

// apps/web/src/hooks/
- use-leagues.ts              // Hook para gerenciar ligas
- use-league-chat.ts          // Hook para chat
- use-league-participants.ts  // Hook para participantes
```

## 🧪 Fase 6: Testes e Qualidade

### 6.1 Testes Unitários
- [ ] Todos os Value Objects
- [ ] Todas as entidades
- [ ] Todos os Use Cases
- [ ] Todos os adapters

### 6.2 Testes E2E
- [ ] Testes para endpoints REST
- [ ] Testes para WebSocket
- [ ] Testes para fluxos completos

### 6.3 Testes de Integração
- [ ] Testes de repositórios com banco real
- [ ] Testes de WebSocket Gateway

## 📚 Fase 7: Documentação

### 7.1 Atualizações no Knowledge
- [ ] Atualizar `knowledge/03-roadmap-inicial.md`
- [ ] Criar `knowledge/08-league-module-complete.md`
- [ ] Atualizar `knowledge/01-comandos-dev.md` se necessário

### 7.2 ADRs (se necessário)
- [ ] ADR para decisões arquiteturais importantes
- [ ] ADR para padrões de WebSocket

## 🎯 Ordem de Implementação

### Sprint 1: Foundation
1. ✅ **Value Objects** (Title, LeagueId, Description, ImageUrl)
2. ✅ **Entidade League** básica
3. ✅ **Primeiro Use Case** (CreateLeagueUseCase)
4. ✅ **Testes unitários** para VOs e entidade

### Sprint 2: Core Domain
1. ✅ **Todos os Use Cases** restantes
2. ✅ **Erros de domínio**
3. ✅ **Testes unitários** para Use Cases
4. ✅ **Interfaces** (repositories e services)

### Sprint 3: Database
1. ✅ **Schema Prisma** (League, LeagueParticipant, ChatMessage)
2. ✅ **Migração** do banco
3. ✅ **Adapters** (Prisma repositories)
4. **Testes** de integração

### Sprint 4: API
1. ✅ **Controllers** e DTOs básicos
2. **WebSocket Gateway** (pendente)
3. ✅ **Module** configuration
4. **Testes** de API (pendente)

### Sprint 5: UI
1. **Páginas** principais
2. **Componentes** básicos
3. **Hooks** e services
4. **Testes** de UI

### Sprint 6: Polish
1. **Testes E2E**
2. **Documentação** final
3. **Refinamentos** de UX
4. **Deploy** e validação

## 🔄 Checklist de Progresso

### ✅ Fase 1: Core Domain
- [x] Value Objects implementados
- [x] Entidades criadas
- [x] Use Cases implementados (completo)
- [x] Erros de domínio definidos
- [x] Testes unitários passando

### ✅ Fase 2: Database
- [x] Schema Prisma atualizado
- [x] Migração executada
- [x] Relações configuradas

### ✅ Fase 3: Adapters
- [x] Repositories implementados
- [x] Chat Gateway implementado
- [ ] Testes de adapters

### ✅ Fase 4: API
- [x] Controllers criados
- [x] DTOs definidos
- [ ] WebSocket funcionando
- [ ] Testes de API

### ✅ Fase 5: UI
- [ ] Páginas criadas
- [ ] Componentes implementados
- [ ] Hooks funcionando
- [ ] UX polida

### ✅ Fase 6: Qualidade
- [ ] Todos os testes passando
- [ ] Documentação atualizada
- [ ] Code review aprovado

## 📝 Notas Importantes

### Regras de Negócio
1. **Owner entra automaticamente** na liga ao criá-la
2. **Máximo de 100 participantes** por liga
3. **Owner não pode ser removido** sem transferir propriedade
4. **Chat em tempo real** via WebSocket
5. **Ranking** baseado em betoletas (futuro)

### Padrões a Seguir
- Usar **Value Objects** para validação
- Implementar **testes unitários** para tudo
- Seguir **Clean Architecture** estritamente
- Manter **commits pequenos** e documentados
- Atualizar **knowledge** conforme progresso

### Referências
- [Módulo Auth](./05-auth-modulo.md) - Padrão de implementação
- [Guia de Módulo](./02-guia-modulo.md) - Estrutura base
- [Visão Geral](./00-visao-geral.md) - Arquitetura do projeto
- [Especificação League](./06-modulo-league) - Requisitos detalhados 