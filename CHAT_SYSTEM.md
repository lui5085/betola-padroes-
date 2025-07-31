# Sistema de Chat ao Vivo - Betola

## 📋 Resumo

Implementamos um sistema completo de chat ao vivo com WebSocket para cada liga, permitindo comunicação em tempo real entre os membros das ligas.

## 🚀 Funcionalidades Implementadas

### Backend (NestJS + Socket.IO)

#### 1. **ChatGateway** (`/api/src/modules/chat/chat.gateway.ts`)
- Gateway WebSocket principal com namespace `/chat`
- Autenticação JWT via WebSocket
- Eventos suportados:
  - `joinLeague` - Entrar no chat da liga
  - `leaveLeague` - Sair do chat da liga
  - `sendMessage` - Enviar mensagem
  - `typing` - Indicador de digitação
- Salas por liga (`league:${leagueId}`)

#### 2. **ChatService** (`/api/src/modules/chat/chat.service.ts`)
- Verificação de membership em ligas
- Persistência de mensagens no banco
- Busca de mensagens recentes e histórico
- Mensagens do sistema (notificações automáticas)
- Usuários ativos por liga

#### 3. **ChatController** (`/api/src/modules/chat/chat.controller.ts`)
- API REST para buscar histórico de mensagens
- Endpoint para usuários ativos na liga
- Autenticação JWT obrigatória

#### 4. **WsJwtGuard** (`/api/src/modules/chat/guards/ws-jwt.guard.ts`)
- Guard de autenticação para WebSocket
- Validação de token JWT
- Anexa informações do usuário ao socket

### Frontend (React + Socket.IO Client)

#### 1. **useChat Hook** (`/web/src/hooks/use-chat.ts`)
- Hook customizado para gerenciar conexão WebSocket
- Estados de conexão e mensagens
- Indicadores de digitação
- Reconexão automática
- Interface TypeScript completa

#### 2. **LeagueChat Component** (`/web/src/components/chat/league-chat.tsx`)
- Componente de chat flutuante
- Design moderno com tema verde (identidade Betola)
- Estados expandido/minimizado
- Scroll automático para novas mensagens
- Indicadores visuais de status
- Suporte a indicadores de digitação

## 🗄️ Banco de Dados

O modelo `LeagueMessage` já existia no schema Prisma:

```prisma
model LeagueMessage {
  id        String   @id @default(uuid())
  leagueId  String
  userId    String  
  content   String
  type      String   @default("TEXT") // TEXT, SYSTEM, BET_SHARE
  metadata  Json?    @default("{}")
  createdAt DateTime @default(now())
  
  league    League       @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  user      User         @relation(fields: [userId], references: [id])
  member    LeagueMember @relation(fields: [leagueId, userId], references: [leagueId, userId])
  
  @@index([leagueId, createdAt])
}
```

## 🔧 Configuração

### Variáveis de Ambiente

- `JWT_SECRET` - Chave secreta para tokens JWT
- `NEXT_PUBLIC_API_URL` - URL da API (default: http://localhost:3002)

### Dependências Adicionadas

**Backend:**
- `@nestjs/websockets@10`
- `@nestjs/platform-socket.io@10`
- `socket.io`

**Frontend:**
- `socket.io-client`
- `date-fns` (para formatação de datas)

## 🎯 Como Usar

1. **No Frontend:** O chat aparece automaticamente nas páginas de liga individual
2. **Conexão Automática:** Quando o usuário entra na página da liga, automaticamente se conecta ao chat
3. **Mensagens em Tempo Real:** Mensagens aparecem instantaneamente para todos os membros online
4. **Persistência:** Mensagens são salvas no banco e carregadas quando o usuário entra no chat

## 🌟 Características Especiais

- **Autenticação Segura:** JWT tokens validados tanto para REST quanto WebSocket
- **Verificação de Membership:** Usuários só podem ver chats das ligas que participam
- **Mensagens do Sistema:** Suporte para notificações automáticas (ex: apostas feitas)
- **Indicadores de Digitação:** Mostra quando outros usuários estão digitando
- **Design Responsivo:** Chat otimizado para desktop e mobile
- **Tema Consistente:** Segue a identidade visual verde do Betola

## 🚀 Próximos Passos (Opcionais)

- [ ] Notificações push para mensagens
- [ ] Upload de imagens/emojis
- [ ] Compartilhamento direto de apostas no chat
- [ ] Moderação de chat (kick/ban usuários)
- [ ] Chat privado entre usuários
- [ ] Histórico de mensagens com paginação infinita

## 🧪 Como Testar

1. Execute `npm run dev` no projeto
2. Entre em uma liga como usuário
3. Abra outra aba/navegador e entre na mesma liga com usuário diferente
4. Digite mensagens e veja a comunicação em tempo real
5. Teste indicadores de digitação
6. Verifique persistência recarregando a página

---

✅ **Sistema de chat ao vivo totalmente funcional e integrado!**