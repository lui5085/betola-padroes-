#!/bin/bash

# Script de configuração automática para desenvolvimento
echo "🚀 Configurando ambiente de desenvolvimento..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logs
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    log_error "Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
log_info "Parando containers existentes..."
docker-compose down 2>/dev/null || true

# Remover volumes antigos se necessário (opcional)
# docker volume prune -f

# Iniciar PostgreSQL
log_info "Iniciando PostgreSQL..."
docker-compose up postgres -d

# Aguardar PostgreSQL ficar pronto
log_info "Aguardando PostgreSQL ficar pronto..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec postgres pg_isready -U user -d mydatabase >/dev/null 2>&1; then
        log_info "PostgreSQL está pronto!"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    log_error "Timeout aguardando PostgreSQL ficar pronto"
    exit 1
fi

# Executar migrações do Prisma
log_info "Executando migrações do banco de dados..."
npx prisma migrate deploy || {
    log_warn "Migrações falharam, tentando criar o banco..."
    npx prisma db push --force-reset
}

# Executar seed se existir
if [ -f "prisma/seed.ts" ]; then
    log_info "Executando seed do banco de dados..."
    npx prisma db seed || log_warn "Seed falhou, continuando..."
fi

# Gerar cliente Prisma
log_info "Gerando cliente Prisma..."
npx prisma generate

log_info "✅ Configuração concluída!"
log_info "📝 Para iniciar o desenvolvimento, execute: npm run dev"
log_info ""
log_info "🔍 Comandos úteis:"
log_info "  - Ver logs do banco: docker-compose logs postgres"
log_info "  - Acessar banco: npx prisma studio"
log_info "  - Reset completo: ./dev-setup.sh --reset"

# Opção de reset completo
if [ "$1" = "--reset" ]; then
    log_warn "Fazendo reset completo do ambiente..."
    docker-compose down -v
    docker system prune -f
    log_info "Reset concluído. Execute o script novamente sem --reset"
fi