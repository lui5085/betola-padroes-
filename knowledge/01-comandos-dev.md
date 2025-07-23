# Comandos de Desenvolvimento

| Ação                 | Comando                       |
| -------------------- | ----------------------------- |
| **Iniciar projeto**  | `./start.sh`                  |
| Instalar deps        | `npm install`                 |
| Subir DB (Docker)    | `docker compose up -d postgres` |
| Rodar apps API + Web | `npm run dev`                 |
| Build geral          | `npm run build`               |
| Testes unitários     | `npm run test`                |
| Lint + format        | `npm run lint && npm run format` |

> **Dica principal:** Use `./start.sh` para iniciar todo o ambiente de desenvolvimento de uma vez.
> 
> O script `start.sh` faz automaticamente:
> - Verifica se o arquivo `.env` existe
> - Instala dependências se necessário
> - Sobe o PostgreSQL via Docker
> - Executa migrations do Prisma
> - Inicia API + Web em modo desenvolvimento 