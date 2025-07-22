# Refatoração Auth/Usuário para Clean Architecture

## Objetivo
Refatorar todo o fluxo de autenticação e usuário para seguir o padrão de Clean Architecture, conforme guia do projeto.

## Checklist de Subtarefas

| Status  | Subtarefa                                      | Commit/PR                                      | Observações                |
|---------|------------------------------------------------|------------------------------------------------|----------------------------|
| ✅      | Criar VO de Email                              | 1ea73db                                        |                            |
| ✅      | Criar VO de Password                           | 4c1846e                                        |                            |
| ✅      | Criar VO de Username                           | f4bcc65                                        |                            |
| ⬜      | Criar VO de UserId/UUID                        |                                                |                            |
| ⬜      | Criar VO de Token                              |                                                |                            |
| ⬜      | Criar VO de Timestamp                          |                                                |                            |
| ⬜      | Refatorar entidades de usuário para usar VOs    |                                                |                            |
| ⬜      | Refatorar casos de uso de auth para usar VOs    |                                                |                            |
| ⬜      | Refatorar repositórios para aceitar VOs         |                                                |                            |
| ⬜      | Garantir testes unitários para todos os VOs     |                                                |                            |
| ⬜      | Atualizar documentação do módulo                |                                                |                            |

## Observações
- Sempre referenciar o commit ou PR que resolve cada subtarefa.
- Atualizar este arquivo a cada avanço relevante. 