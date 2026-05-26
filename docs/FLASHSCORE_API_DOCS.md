# FlashScore4 API — Documentação Completa

**Host:** `flashscore4.p.rapidapi.com`  
**Base URL:** `https://flashscore4.p.rapidapi.com/api/flashscore/v2`  
**Método:** Todos os endpoints são `GET`

## Headers obrigatórios

```
x-rapidapi-host: flashscore4.p.rapidapi.com
x-rapidapi-key: 9dd212e6c0msh97b8a2f16abd248p1a874djsn80b358b44056
```

## IDs importantes para o Betola

| Recurso | Valor |
|---|---|
| `sport_id` para futebol | `1` |
| Timezone Fortaleza | `America/Fortaleza` |
| Timezone Brasília | `America/Sao_Paulo` |

> Para descobrir `tournament_template_id` e `tournament_stage_id` do Brasileirão, use o endpoint **Search** ou **Get_country_tournaments** com `country_id` do Brasil.

---

## GERAL

### GET /api/flashscore/v2/general/sports
Retorna todos os esportes disponíveis.

**Parâmetros:** nenhum

---

### GET /api/flashscore/v2/general/countries
Retorna países disponíveis para um esporte.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `sport_id` | integer | ✅ | `1` |

---

### GET /api/flashscore/v2/general/tournaments
Retorna torneios de um país e esporte.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `sport_id` | integer | ✅ | `1` |
| `country_id` | integer | ✅ | `176` |

---

### GET /api/flashscore/v2/general/search
Busca times, jogadores e torneios por nome.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `q` | string | ✅ | `brasileirao` |

---

## PARTIDAS

### GET /api/flashscore/v2/matches/list
Retorna partidas por dia relativo (ontem, hoje, amanhã, etc.).

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `sport_id` | integer | ✅ | `1` para futebol |
| `day` | string | ✅ | `-7` a `7` (0 = hoje) |
| `timezone` | string | ❌ | `America/Sao_Paulo` |

---

### GET /api/flashscore/v2/matches/list-by-date
Retorna partidas de uma data específica.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `sport_id` | integer | ✅ | `1` |
| `date` | string (date) | ✅ | `2025-05-25` |
| `timezone` | string | ❌ | `America/Sao_Paulo` |

---

### GET /api/flashscore/v2/matches/live
Retorna todas as partidas ao vivo de um esporte.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `sport_id` | integer | ✅ | `1` |
| `timezone` | string | ❌ | `America/Sao_Paulo` |

---

### GET /api/flashscore/v2/matches/details
Retorna informações detalhadas de uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/h2h
Retorna histórico de confrontos diretos entre os dois times da partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/odds
Retorna odds de casas de aposta para uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |
| `geo_ip_code` | string | ❌ | `BR` |

---

### GET /api/flashscore/v2/matches/penalties
Retorna informações de pênaltis de uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/draw
Retorna informações de empate de uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `xp0yZYPr` |

---

### GET /api/flashscore/v2/matches/standings
Retorna a classificação relacionada a uma partida (tabela do campeonato).

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |
| `type` | string | ✅ | `overall`, `home`, `away` |

---

### GET /api/flashscore/v2/matches/standings/ht-ft
Retorna classificação por resultado no intervalo/final (HT/FT).

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |
| `type` | string | ✅ | `overall`, `home`, `away` |

---

### GET /api/flashscore/v2/matches/standings/over-under
Retorna classificação over/under relacionada a uma partida.

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |
| `type` | string | ✅ | `overall`, `home`, `away` |
| `sub_type` | string | ❌ | `0.5`, `1.5`, `2.5`, `3.5`, `4.5`, `5.5`, `6.5`, `7.5`, `8.5` |

---

### GET /api/flashscore/v2/matches/standings/top-scorers
Retorna artilheiros relacionados a uma partida (campeonato).

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/standings/form
Retorna classificação por forma recente relacionada a uma partida.

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |
| `type` | string | ✅ | `overall`, `home`, `away` |

---

## PARTIDA — SUB-RECURSOS

### GET /api/flashscore/v2/matches/match/summary
Retorna resumo da partida com eventos principais (gols, cartões, etc.).

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `AHz58q34` |

---

### GET /api/flashscore/v2/matches/match/commentary
Retorna narração ao vivo de uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/match/stats
Retorna estatísticas detalhadas de uma partida (posse, chutes, escanteios, etc.).

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/match/lineups
Retorna escalações dos dois times de uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/match/player-stats
Retorna estatísticas individuais dos jogadores de uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `GCxZ2uHc` |

---

### GET /api/flashscore/v2/matches/match/match-history
Retorna dados históricos de uma partida.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `IZs6VHJE` |

---

### GET /api/flashscore/v2/matches/match/point-by-point
Retorna dados ponto a ponto (principalmente para tênis).

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `match_id` | string | ✅ | `xp0yZYPr` |

---

## TORNEIOS

### GET /api/flashscore/v2/tournaments/ids
Retorna IDs de um torneio a partir da URL do FlashScore.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `tournament_url` | string | ✅ | `/football/brazil/serie-a/` |

> **Use este endpoint primeiro** para obter `tournament_template_id` e `tournament_stage_id` do Brasileirão.

---

### GET /api/flashscore/v2/tournaments/details
Retorna detalhes de um torneio.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `tournament_stage_id` | string | ✅ | `dINOZk9Q` |

---

### GET /api/flashscore/v2/tournaments/fixtures
Retorna próximas partidas de um torneio.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `tournament_template_id` | string | ✅ | `QVmLl54o` |
| `season_id` | integer | ✅ | `187` |
| `page` | integer | ❌ | `1` |

---

### GET /api/flashscore/v2/tournaments/results
Retorna resultados de partidas de um torneio.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `tournament_template_id` | string | ✅ | `QVmLl54o` |
| `season_id` | integer | ✅ | `187` |
| `page` | integer | ❌ | `1` |

---

### GET /api/flashscore/v2/tournaments/standings
Retorna classificação de um torneio.

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `tournament_id` | string | ✅ | `A1MYWy8T` |
| `tournament_stage_id` | string | ✅ | `dINOZk9Q` |
| `type` | string | ✅ | `overall`, `home`, `away` |

---

### GET /api/flashscore/v2/tournaments/standings/top-scorers
Retorna artilheiros de um torneio.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `tournament_id` | string | ✅ | `A1MYWy8T` |
| `tournament_stage_id` | string | ✅ | `dINOZk9Q` |

---

### GET /api/flashscore/v2/tournaments/standings/ht-ft
Retorna classificação HT/FT de um torneio.

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `tournament_id` | string | ✅ | `A1MYWy8T` |
| `tournament_stage_id` | string | ✅ | `dINOZk9Q` |
| `type` | string | ✅ | `overall`, `home`, `away` |

---

### GET /api/flashscore/v2/tournaments/standings/over-under
Retorna classificação over/under de um torneio.

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `tournament_id` | string | ✅ | `A1MYWy8T` |
| `tournament_stage_id` | string | ✅ | `dINOZk9Q` |
| `type` | string | ✅ | `overall`, `home`, `away` |
| `sub_type` | string | ❌ | `0.5`, `1.5`, `2.5`, `3.5`, `4.5`, `5.5`, `6.5`, `7.5`, `8.5` |

---

### GET /api/flashscore/v2/tournaments/standings/form
Retorna classificação por forma recente de um torneio.

| Parâmetro | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `tournament_id` | string | ✅ | `A1MYWy8T` |
| `tournament_stage_id` | string | ✅ | `dINOZk9Q` |
| `type` | string | ✅ | `overall`, `home`, `away` |

---

### GET /api/flashscore/v2/tournaments/archives
Retorna temporadas arquivadas de um torneio.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `tournament_stage_id` | string | ✅ | `dINOZk9Q` |

---

### GET /api/flashscore/v2/tournaments/draw
Retorna chave/bracket de um torneio eliminatório.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `tournament_id` | string | ✅ | `WYZ0Bk15` |
| `tournament_stage_id` | string | ✅ | `lvuRLjMi` |

---

## TIMES

### GET /api/flashscore/v2/teams/details
Retorna informações detalhadas de um time.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `team_url` | string | ✅ | `/team/flamengo/abc123/` |

---

### GET /api/flashscore/v2/teams/squad
Retorna elenco de um time.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `team_url` | string | ✅ | `/team/flamengo/abc123/` |

---

### GET /api/flashscore/v2/teams/fixtures
Retorna próximas partidas de um time.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `team_id` | string | ✅ | `W8mj7MDD` |
| `page` | integer | ❌ | `1` |

---

### GET /api/flashscore/v2/teams/results
Retorna resultados recentes de um time.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `team_id` | string | ✅ | `W8mj7MDD` |
| `page` | integer | ❌ | `1` |

---

### GET /api/flashscore/v2/teams/transfers
Retorna histórico de transferências de um time.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `team_id` | string | ✅ | `W8mj7MDD` |

---

## JOGADORES

### GET /api/flashscore/v2/players/details
Retorna informações detalhadas de um jogador.

| Parâmetro | Tipo | Obrigatório | Exemplo |
|---|---|---|---|
| `player_url` | string | ✅ | `/player/nome-jogador/abc123/` |

---

## Endpoints mais úteis para o Betola

| Prioridade | Endpoint | Uso |
|---|---|---|
| 1 | `tournaments/ids` | Descobrir IDs do Brasileirão |
| 2 | `matches/list` ou `matches/list-by-date` | Partidas da rodada |
| 3 | `matches/live` | Partidas ao vivo |
| 4 | `matches/odds` | Odds para cálculo de apostas |
| 5 | `matches/details` | Detalhes e resultado da partida |
| 6 | `matches/match/summary` | Eventos (gols, cartões) |
| 7 | `tournaments/standings` | Classificação do Brasileirão |
| 8 | `tournaments/fixtures` | Próximas partidas do campeonato |
| 9 | `tournaments/results` | Resultados para liquidação de apostas |
| 10 | `teams/details` | Informações dos times |

---

## Exemplo de chamada

```bash
curl "https://flashscore4.p.rapidapi.com/api/flashscore/v2/matches/list-by-date?sport_id=1&date=2025-05-25&timezone=America/Sao_Paulo" \
  -H "x-rapidapi-host: flashscore4.p.rapidapi.com" \
  -H "x-rapidapi-key: SUA_CHAVE_AQUI"
```
