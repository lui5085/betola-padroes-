# Betola — Apostas Esportivas entre Amigos

Plataforma de apostas esportivas entre amigos focada no Brasileirão Serie A. Os usuários criam ligas privadas, apostam com moeda virtual (Betoletas) e competem entre si.

> **Fork** do projeto original [arthurbrit0/betola](https://github.com/arthurbrit0/betola) com melhorias na integração de APIs externas e correções de configuração.

## Mudanças em relação ao projeto original

### Integração com FlashScore4 API
- Substituição completa da API-Football (api-sports.io) pela **FlashScore4 API** (RapidAPI)
- Acesso à temporada atual do Brasileirão (sem limitação de plano free)
- Suporte a **odds reais** de casas de apostas via `/matches/odds`
- Partidas ao vivo, standings, fixtures e detalhes de partidas
- Cache inteligente com rate limiting para respeitar limites da API

### Correções de infraestrutura
- Correção de conflito de porta do PostgreSQL (porta 5434 para evitar conflito com Postgres local)
- Correção de paths do TypeScript (`@betola/core/shared/*`) que causavam `undefined` em runtime
- Correção do `nest-cli.json` para apontar o `entryFile` correto no monorepo
- Adição de `legacy-peer-deps` no `.npmrc` para resolver conflitos de versão do React
- Correção do script `dev` da API para funcionar no Windows (aspas simples → compatível)

### Correções de funcionalidade
- Páginas de login e registro agora fazem chamadas reais à API (antes eram apenas visuais)
- Variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`) adicionadas corretamente para a API
- Limpeza de `dist` antigos que causavam conflito de módulos duplicados

---

## Arquitetura

Monorepo com Turborepo:

```
betola/
├── apps/
│   ├── api/          # NestJS — Backend REST API + WebSocket
│   └── web/          # Next.js 14 — Frontend
├── packages/
│   ├── core/         # Domínio e casos de uso (Clean Architecture)
│   ├── adapters/     # Implementações de repositórios e serviços externos
│   └── ui/           # Componentes UI compartilhados (Radix + Tailwind)
├── prisma/           # Schema do banco de dados
└── docker-compose.yml
```

## Pré-requisitos

- Node.js >= 18
- npm 10+
- Docker (para o PostgreSQL)

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Subir o banco de dados
docker compose up postgres -d

# 3. Configurar variáveis de ambiente
cp .env.sample .env
cp apps/api/.env.sample apps/api/.env
cp apps/web/.env.sample apps/web/.env
```

Edite o `.env` na raiz e adicione sua chave da FlashScore4 API (RapidAPI):

```env
FLASHSCORE_API_KEY="sua-chave-rapidapi"
```

```bash
# 4. Sincronizar banco de dados
npx prisma generate
npx prisma db push

# 5. Rodar em modo desenvolvimento
npm run dev
```

O frontend roda em **http://localhost:3000** e a API em **http://localhost:3002**.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do PostgreSQL |
| `JWT_SECRET` | Segredo para tokens JWT |
| `FLASHSCORE_API_KEY` | Chave da FlashScore4 API (RapidAPI) |
| `FLASHSCORE_BASE_URL` | URL base da API (`https://flashscore4.p.rapidapi.com/api/flashscore/v2`) |
| `BRASILEIRAO_TOURNAMENT_TEMPLATE_ID` | ID do template do Brasileirão (`Yq4hUnzQ`) |
| `BRASILEIRAO_SEASON_ID` | ID da temporada atual (`185`) |
| `NEXT_PUBLIC_API_URL` | URL da API para o frontend (`http://localhost:3002`) |

## APIs externas

| API | Uso | Plano |
|-----|-----|-------|
| [FlashScore4](https://rapidapi.com/flashscore4) | Fixtures, standings, odds, live matches | RapidAPI (free tier disponível) |

## Stack

- **Backend:** NestJS, Prisma, PostgreSQL, JWT, WebSocket (Socket.io)
- **Frontend:** Next.js 14, React 18, Tailwind CSS, Radix UI, SWR
- **Monorepo:** Turborepo, npm workspaces
- **Arquitetura:** Clean Architecture (core → adapters → api)

## Padrões de Projeto

O projeto implementa 4 padrões de projeto documentados em [`docs/padroes/`](./docs/padroes/):

| Padrão | Tipo | Descrição |
|--------|------|-----------|
| [Strategy](./docs/padroes/01-strategy.md) | Comportamental | Algoritmos intercambiáveis (hash, auth, email) sem alterar os casos de uso |
| [Repository](./docs/padroes/02-repository.md) | Estrutural (DDD) | Abstrai a persistência — domínio não conhece banco de dados |
| [Factory](./docs/padroes/03-factory.md) | Criacional | Encapsula criação de apostas simples/múltiplas em `BetFactory` |
| [Decorator](./docs/padroes/04-decorator.md) | Estrutural | Adiciona logging e limite diário ao `PlaceBetUseCase` sem modificá-lo |
