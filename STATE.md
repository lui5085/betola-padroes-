# Estado do Projeto — Betola

> Última atualização: 2026-05-26  
> Branch ativa: `feat/flashscore-api-integration`

---

## 1. Visão Geral

| Item | Valor |
|------|-------|
| Nome | Betola |
| Descrição | Plataforma de apostas esportivas entre amigos (Brasileirão) |
| Monorepo | Turborepo + npm workspaces |
| Node.js | >= 18 |
| Banco | PostgreSQL 14 (Docker, porta 5434) |
| Branch principal | `feat/flashscore-api-integration` |
| Fork | https://github.com/lui5085/betola-padroes-.git |
| Origem | https://github.com/arthurbrit0/betola |

---

## 2. Estrutura de diretórios

```
betola/
├── apps/
│   ├── api/              # NestJS (porta 3002)
│   └── web/              # Next.js 14 (porta 3000)
├── packages/
│   ├── core/             # Domínio + Use Cases (Clean Architecture)
│   ├── adapters/         # Implementações (Prisma, FlashScore, Bcrypt, JWT)
│   └── ui/              # Componentes compartilhados (Radix + Tailwind)
├── prisma/               # Schema do banco
├── docs/
│   └── padroes/          # Documentação dos 4 padrões de projeto
├── docker-compose.yml
├── .env                  # Variáveis de ambiente (não commitado)
└── .env.sample           # Template das variáveis
```

---

## 3. APIs Externas

| API | Uso | Base URL | Auth |
|-----|-----|----------|------|
| FlashScore4 (RapidAPI) | Fixtures, standings, odds, live | `https://flashscore4.p.rapidapi.com/api/flashscore/v2` | `x-rapidapi-key` + `x-rapidapi-host` |

### IDs do Brasileirão (FlashScore)

| Recurso | Valor |
|---------|-------|
| `tournament_template_id` | `Yq4hUnzQ` |
| `tournament_id` | `pv7V3RRE` |
| `tournament_stage_id` | `hdLUdQGi` |
| `season_id` | `185` |

---

## 4. Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL="postgresql://betola:betola123@localhost:5434/betola_db"

# JWT
JWT_SECRET="..."
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."

# API
PORT=3002
NEXT_PUBLIC_API_URL="http://localhost:3002"

# FlashScore
FLASHSCORE_API_KEY="<sua-chave-rapidapi>"
FLASHSCORE_API_HOST="flashscore4.p.rapidapi.com"
FLASHSCORE_BASE_URL="https://flashscore4.p.rapidapi.com/api/flashscore/v2"
BRASILEIRAO_TOURNAMENT_TEMPLATE_ID="Yq4hUnzQ"
BRASILEIRAO_TOURNAMENT_ID="pv7V3RRE"
BRASILEIRAO_TOURNAMENT_STAGE_ID="hdLUdQGi"
BRASILEIRAO_SEASON_ID="185"
```

---

## 5. Banco de Dados (Prisma Schema)

### Modelos

| Modelo | Descrição |
|--------|-----------|
| `User` | Usuário com email, username, senha hash, admin flag |
| `Profile` | Perfil do usuário (displayName, avatar, bio, favoriteTeam) |
| `Wallet` | Carteira virtual (saldo em Betoletas, padrão 1000) |
| `Team` | Time de futebol (nome, logo, externalId) |
| `Match` | Partida (times, placar, status, rodada, season) |
| `Market` | Mercado de aposta (tipo, opções, odds) |
| `Bet` | Aposta do usuário (tipo SINGLE/MULTIPLE, odds, valor, status) |
| `BetSelection` | Seleção individual dentro de uma aposta |
| `League` | Liga privada entre amigos (código, membros, ranking) |
| `LeagueMember` | Membro de uma liga (pontos, posição, role) |
| `LeagueMessage` | Mensagem no chat da liga |
| `LeagueInvite` | Convite para entrar em uma liga |
| `Notification` | Notificação do sistema para o usuário |

### Docker

```yaml
postgres:
  image: postgres:14-alpine
  ports: 5434:5432
  env: POSTGRES_USER=betola, POSTGRES_PASSWORD=betola123, POSTGRES_DB=betola_db
```

---

## 6. Módulos da API (NestJS)

| Módulo | Rotas principais | Descrição |
|--------|-----------------|-----------|
| Auth | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/refresh` | Autenticação JWT com cookies httpOnly |
| Matches | `/matches`, `/matches/sync`, `/matches/live` | Partidas do Brasileirão via FlashScore |
| Betting | `/bets`, `/bets/calculate`, `/bets/sync-odds` | Sistema de apostas com odds |
| Leagues | `/leagues`, `/leagues/join`, `/leagues/:id/ranking` | Ligas privadas entre amigos |
| Wallet | `/wallet/balance`, `/wallet/add-funds` | Carteira de Betoletas |
| Chat | `/chat/leagues/:id/messages` | Chat em tempo real (WebSocket) |
| Notifications | `/notifications`, `/notifications/:id/read` | Notificações do sistema |
| Admin | `/admin/bets/pending`, `/admin/matches`, `/admin/stats` | Painel administrativo |
| Teams | `/teams/brasileirao`, `/teams/brasileirao/standings` | Times e classificação |

---

## 7. Padrões de Projeto

| Padrão | Tipo | Status | Implementado por |
|--------|------|--------|------------------|
| Strategy | Comportamental (GoF) | ✅ Existente | Projeto original |
| Repository | Estrutural (DDD) | ✅ Existente | Projeto original |
| Factory | Criacional (GoF) | ✅ Implementado | Equipe (3ª entrega) |
| Decorator | Estrutural (GoF) | ✅ Implementado | Equipe (3ª entrega) |

### Localização no código

- **Strategy:** `packages/core/src/auth/services/` (IHasher, IAuthenticator, IEmailSender)
- **Repository:** `packages/core/*/repositories/` → `packages/adapters/src/*/persistence/`
- **Factory:** `packages/core/src/modules/betting/domain/factories/bet-factory.ts`
- **Decorator:** `packages/core/src/modules/betting/application/decorators/`

---

## 8. Frontend (Next.js)

### Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Login (email + senha → API) |
| `/register` | Registro (username, email, senha → API) |
| `/dashboard` | Dashboard do usuário (protegida) |
| `/matches` | Partidas do Brasileirão + standings |
| `/minhas-apostas` | Apostas do usuário |
| `/leagues` | Ligas do usuário |
| `/profile` | Perfil do usuário |

### Autenticação

- Login retorna `accessToken` + `refreshToken` em cookies httpOnly
- Middleware Next.js protege rotas `/dashboard` e `/profile`
- Frontend usa `NEXT_PUBLIC_API_URL` para chamadas à API

---

## 9. Branches

| Branch | Status | Descrição |
|--------|--------|-----------|
| `feat/flashscore-api-integration` | ✅ Ativa | Integração FlashScore + padrões Factory/Decorator |
| `feat/ingest-odds-api` | Base | Branch original com core de jogos e ligas |
| `master` | Desatualizada | Estado inicial com auth básico |

---

## 10. Problemas conhecidos

| Problema | Causa | Workaround |
|----------|-------|------------|
| Postgres local conflita com Docker | Postgres instalado na máquina usa porta 5432 | Docker mapeado para porta 5434 |
| FlashScore não retorna campo `round` nos fixtures | API não fornece matchday | Ordenar por data e mostrar próximos 10 |
| `npm run dev` mostra `ENOWORKSPACES` no web | Bug do npm com workspaces + next.js | Ignorar — não afeta funcionamento |
| Odds dependem de `match_id` string do FlashScore | Hash numérico pode não reverter | Manter mapa interno de IDs |

---

## 11. Como rodar

```bash
docker compose up postgres -d
npm install
npx prisma generate
npx prisma db push
npm run dev
# Frontend: http://localhost:3000
# API: http://localhost:3002
```

---

## 12. Commits recentes

```
eb9d821 docs: add design patterns documentation (Strategy, Repository, Factory, Decorator)
9def584 docs: update README with project changes and setup instructions
ddc51e6 fix: show next 10 matches by date instead of grouping by matchday
c3237d3 feat: migrate to FlashScore4 API for football data integration
0df1f0a feat(betting): implementação do core de jogo e ligas
```
