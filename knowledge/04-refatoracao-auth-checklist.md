# Refatoração Auth/Usuário para Clean Architecture

## Objetivo
Refatorar todo o fluxo de autenticação e usuário para seguir o padrão de Clean Architecture, conforme guia do projeto.

## Checklist de Subtarefas

| Status  | Subtarefa                                      | Commit/PR                                      | Observações                |
|---------|------------------------------------------------|------------------------------------------------|----------------------------|
| ✅      | Criar VO de Email                              | 1ea73db                                        |                            |
| ✅      | Criar VO de Password                           | 4c1846e                                        |                            |
| ✅      | Criar VO de Username                           | f4bcc65                                        |                            |
| ✅      | Criar VO de UserId/UUID                        | 6a12b73                                        |                            |
| ✅      | Criar VO de Token                              | 18189e2                                        |                            |
| ✅      | Criar VO de Timestamp                          | 9d23215                                        |                            |
| ✅      | Refatorar entidades de usuário para usar VOs    | (commit atual)                                  |                            |
| ✅      | Refatorar casos de uso de auth para usar VOs    | (commit atual)                                  |                            |
| ✅      | Refatorar repositórios para aceitar VOs         | (commit atual)                                  |                            |
| ✅      | Garantir testes unitários para todos os VOs     | (já coberto)                                    |                            |
| ✅      | Garantir testes unitários para casos de uso principais (login, registro, reset, update profile) | (commit atual)                                 |                            |
| ✅      | Teste unitário: RegisterUserUseCase (registro)  | (commit atual)                                 |                            |
| ✅      | Teste unitário: AuthenticateUserUseCase (login) | (commit atual)                                 |                            |
| ✅      | Teste unitário: RequestPasswordResetUseCase (reset) | (commit atual)                                 |                            |
| ✅      | Teste unitário: ResetPasswordUseCase (reset)    | (commit atual)                                 |                            |
| ✅      | Teste unitário: UpdateProfileUseCase (update profile) | (commit atual)                                 |                            |
| ✅      | Atualizar documentação do módulo                | (commit atual)                                 |                            |

## Observações
- Sempre referenciar o commit ou PR que resolve cada subtarefa.
- Atualizar este arquivo a cada avanço relevante. 