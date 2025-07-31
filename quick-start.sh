#!/bin/bash

# Script de início rápido para desenvolvimento (SQLite)
echo "⚡ Configuração rápida para desenvolvimento local..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Configurar SQLite
log_info "Configurando SQLite para desenvolvimento rápido..."

# Copiar configuração local
cp .env.local .env

# Alterar schema para SQLite
sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# Criar diretório prisma se não existir
mkdir -p prisma

# Gerar cliente Prisma
log_info "Gerando cliente Prisma..."
npx prisma generate

# Executar migrações
log_info "Configurando banco de dados..."
npx prisma db push --force-reset

# Executar seed se existir
if [ -f "prisma/seed.ts" ]; then
    log_info "Executando seed..."
    npx prisma db seed 2>/dev/null || log_warn "Seed não configurado, continuando..."
fi

log_info "✅ Configuração rápida concluída!"
log_info "🚀 Para iniciar: npm run dev"
log_info ""
log_info "💡 Dicas:"
log_info "  - Para PostgreSQL (produção): npm run setup"
log_info "  - Para visualizar dados: npm run db:studio"
log_info "  - Para reset: rm prisma/dev.db && ./quick-start.sh"