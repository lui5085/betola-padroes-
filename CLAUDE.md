# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start (Recommended)
- `npm run quick-start` - **🚀 Super rápido**: SQLite local, sem Docker
- `npm run dev` - Start development servers for all apps (after setup)
- `npm run setup` - **PostgreSQL completo**: Para desenvolvimento com Docker

### Core Commands
- `npm run build` - Build all applications and packages
- `npm run lint` - Run linting across all packages
- `npm run check-types` - Run TypeScript type checking
- `npm run format` - Format code using Prettier

### Database Management
- `npm run start:db` - Start PostgreSQL container only
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - **Nuclear option**: Reset entire development environment

### Testing
- **API tests:** `cd apps/api && npm run test` (unit tests) or `npm run test:e2e` (e2e tests)
- **Single test file:** `cd apps/api && npm run test -- --testNamePattern="AuthenticateUserUseCase"`
- **Core package:** Tests are located in `packages/core/` but no test runner is configured yet

### Application-Specific
- **API development:** `cd apps/api && npm run dev`
- **Web development:** `cd apps/web && npm run dev` (runs on port 3005)
- **Watch mode for packages:** `cd packages/core && npm run dev` (TypeScript watch mode)

### First Time Setup

**Opção 1: Rápida (SQLite - Recomendada)**
1. `npm run quick-start` - Configuração automática com SQLite
2. `npm run dev` - Pronto para desenvolver!

**Opção 2: Completa (PostgreSQL)**
1. `npm run setup` - Configuração com PostgreSQL (requer Docker)
2. `npm run dev` - Start developing

### Troubleshooting
- **Portas ocupadas**: Pare processos nas portas 3002 (API) e 3005 (Web)
- **Database issues**: `npm run db:reset` then `npm run setup`
- **SQLite corrupto**: `rm prisma/dev.db && npm run quick-start`
- **Docker issues**: Ensure Docker is running and try `npm run db:reset`

## Current Project Status

**Current Branch:** `feat/ingest-odds-api` 
**Main Branch:** `master`

This branch is focused on implementing odds ingestion from external APIs to improve the betting system's data accuracy and real-time capabilities.

## Architecture Overview

This is the **Betola** - a comprehensive **Clean Architecture + DDD monorepo** using Turborepo for a gamified football betting platform with fictional currency ("betoletas").

### Package Structure
- `packages/core/` - Pure domain logic organized by modules (TypeScript only, no external dependencies)
- `packages/adapters/` - Infrastructure implementations (Prisma, JWT, bcrypt, etc.)
- `packages/ui/` - Shared React components with Tailwind CSS and Shadcn/ui
- `apps/api/` - NestJS API that orchestrates I/O and injects adapters
- `apps/web/` - Next.js frontend with complete betting interface

### Core Modules (DDD Structure)
The core package follows a hybrid structure:
- Legacy auth module: `packages/core/src/auth/` (being migrated)
- Modern modules: `packages/core/src/modules/` with DDD structure:
  - `domain/entities/` - Business entities
  - `domain/value-objects/` - Value objects with validation
  - `domain/repositories/` - Repository interfaces
  - `application/use-cases/` - Application use cases

#### Implemented Modules:
1. **auth** - User authentication and profiles (legacy structure in `/auth/`)
2. **betting** - Bet placement, odds, and selections (`/modules/betting/`)
3. **leagues** - User leagues with ranking system (`/modules/leagues/`)
4. **matches** - Football matches and markets (`/modules/matches/`)
5. **wallet** - Betoletas management and transactions (`/modules/wallet/`)

#### Shared Components:
- `packages/core/src/shared/` - Base entities, value objects, Result pattern, and common utilities

### Dependency Flow
**Controller** → **UseCase (core)** → **Repository/Service Interface** → **Adapter Implementation**

### Key Principles
1. **No business logic outside `packages/core/`**
2. **Validation lives in Value Objects** (BetAmount, Odds, LeagueCode, etc.)
3. **Clean interfaces:** Core defines interfaces, adapters implement them
4. **Domain-driven:** Entities, repositories, and use cases drive the design
5. **Result pattern:** Use cases return `Result<T>` for explicit error handling

## Authentication Module

Located in `packages/core/src/auth/`:

### Value Objects
- `Email` - Email format validation and uniqueness
- `Password` - Password strength and security rules  
- `Username` - Format and uniqueness validation
- `UserId` - UUID v4 validation
- `Token` - 64-character hexadecimal tokens
- `Timestamp` - Safe date/time handling

### Use Cases
- `AuthenticateUserUseCase` - User login
- `RegisterUserUseCase` - New user registration
- `RequestPasswordResetUseCase` - Password reset request
- `ResetPasswordUseCase` - Password reset execution
- `UpdateProfileUseCase` - Profile updates

### Testing Strategy
All Value Objects and Use Cases have comprehensive unit tests. Run them with:
```bash
cd packages/core && npm run test
```

## Database

- **ORM:** Prisma with PostgreSQL
- **Schema:** `prisma/schema.prisma`
- **Main entities:** User, Profile (one-to-one relationship)
- **Migrations:** `prisma/migrations/`

## Code Patterns

### Creating New Features
1. **Domain First:** Define entities and value objects in the appropriate module under `packages/core/src/modules/`
2. **Use Cases:** Create application use cases that orchestrate domain logic and return `Result<T>`
3. **Interfaces:** Define repository/service interfaces in the domain layer
4. **Adapters:** Implement interfaces in `packages/adapters/`
5. **API:** Wire everything together in NestJS controllers with proper DTOs
6. **Frontend:** Add React components, API calls, and state management
7. **Database:** Update Prisma schema and run migrations
8. **Tests:** Write unit tests for all value objects and use cases

### Error Handling
- Domain errors extend base error classes
- Use cases throw domain-specific exceptions
- Controllers catch and transform to HTTP responses
- Frontend handles API errors with proper user feedback

### Value Object Pattern
```typescript
// Always validate in constructor
class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email format');
    }
  }
  
  getValue(): string {
    return this.value;
  }
}
```

### Result Pattern
Use cases return `Result<T>` for explicit error handling:
```typescript
export class Result<T> {
  static success<T>(value: T): Result<T>
  static failure<T>(error: string): Result<T>
  isSuccess(): boolean
  isFailure(): boolean
  get value(): T
  get error(): string
}
```

## Important Notes

- **Node.js version:** >=18 (specified in package.json engines)
- **Package manager:** npm (lockfile: package-lock.json)
- **TypeScript:** Strict mode enabled across all packages
- **Linting:** ESLint with Prettier integration
- **UI Framework:** Next.js 14 with Tailwind CSS and Radix UI components
- **Authentication:** JWT tokens with bcrypt password hashing
- **Infrastructure:** Docker Compose for local development, Prisma for database management
- **External APIs:** Football API integration for match data and odds

## Development Workflow

1. Make changes to core domain logic first
2. Update adapters to implement new interfaces
3. Wire together in API controllers
4. Add frontend components and API integration
5. Always run tests and type checking before committing
6. Use small, documented commits with updated documentation