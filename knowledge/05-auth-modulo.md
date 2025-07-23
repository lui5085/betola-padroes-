# Módulo de Autenticação/Usuário (Auth)

## Visão Geral

Este módulo é responsável por toda a lógica de autenticação, registro, recuperação de senha e atualização de perfil dos usuários, seguindo os princípios de Clean Architecture e DDD.

- **Local:** `packages/core/src/auth/`
- **Fluxo:** Controller/API → UseCase (core) → Provider (interface) → Adapter (implementação)

## Estrutura de Pastas

- `entities/` — Entidades de domínio (`User`, `Profile`)
- `repositories/` — Interfaces de repositórios (`IUsersRepository`, `IProfilesRepository`)
- `services/` — Interfaces de serviços (`IHasher`, `IEmailSender`, etc.)
- `use-cases/` — Casos de uso (login, registro, reset, update profile)
- `errors/` — Erros de domínio

## Value Objects (VOs)

- **Email:** Validação de formato e unicidade.
- **Password:** Regras de força e segurança.
- **Username:** Regras de formato e unicidade.
- **UserId:** UUID v4.
- **Token:** 64 caracteres hexadecimais.
- **Timestamp:** Data/hora segura.

Exemplo de uso:
```ts
const email = new Email('user@exemplo.com');
const password = new Password('Senha@123');
```

## Casos de Uso

- **AuthenticateUserUseCase:** Login do usuário.
- **RegisterUserUseCase:** Registro de novo usuário.
- **RequestPasswordResetUseCase:** Solicitação de reset de senha.
- **ResetPasswordUseCase:** Redefinição de senha.
- **UpdateProfileUseCase:** Atualização de perfil.

Cada caso de uso recebe dados primitivos, instancia os VOs e executa as regras de negócio. Fluxos de erro são tratados por exceptions de domínio.

## Testes

- Todos os VOs possuem testes unitários.
- Todos os casos de uso principais possuem testes unitários.
- Para rodar os testes:
  ```sh
  cd packages/core && npm run test
  ```

## Adapters e Integração

- Os repositórios/interfaces são implementados em `packages/adapters`.
- A API (Nest) injeta os adapters e conecta com os casos de uso.

## Checklist de Refatoração

Veja o progresso e histórico em `knowledge/04-refatoracao-auth-checklist.md`.

## Exemplos de Fluxo

1. **Login:**
   - Controller recebe email/senha → chama `AuthenticateUserUseCase` → retorna token ou erro.
2. **Registro:**
   - Controller recebe dados → chama `RegisterUserUseCase` → cria usuário e perfil.

## Referências
- [Visão Geral](./00-visao-geral.md)
- [Checklist Auth](./04-refatoracao-auth-checklist.md)
- [Guia de Módulo](./02-guia-modulo.md) 