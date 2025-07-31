// Re-exportar tudo do domínio
export * from './shared/domain/value-objects/id';
export * from './shared/domain/value-objects/date-time';
export * from './shared/domain/value-objects/money';
export * from './shared/domain/entities/base-entity';
export * from './shared/domain/errors/domain-error';
export * from './shared/domain/errors/validation-error';
export * from './shared/application/result';
export * from './shared/application/use-case';

// Auth module
export * from './auth/entities/user';
export * from './auth/entities/profile';
export * from './auth/repositories/users-repository';
export * from './auth/repositories/profiles-repository';
export * from './auth/services/hasher';
export * from './auth/services/authenticator';
export * from './auth/services/email-sender';
export * from './auth/use-cases/authenticate-user-use-case';
export * from './auth/use-cases/register-user-use-case';
export * from './auth/use-cases/get-profile-use-case';
export * from './auth/use-cases/update-profile-use-case';
export * from './auth/use-cases/request-password-reset-use-case';
export * from './auth/use-cases/reset-password-use-case';
export * from './auth/use-cases/errors/email-already-exists-error';
export * from './auth/use-cases/errors/invalid-credentials-error';
export * from './auth/use-cases/errors/invalid-reset-token-error';
export * from './auth/use-cases/errors/username-already-exists-error';
export * from './auth/use-cases/errors/user-not-found-error';

// Betting module
export * from './modules/betting/domain/entities/bet';
export * from './modules/betting/domain/entities/bet-selection';
export * from './modules/betting/domain/value-objects/bet-id';
export * from './modules/betting/domain/value-objects/bet-amount';
export * from './modules/betting/domain/value-objects/bet-status';
export * from './modules/betting/domain/value-objects/market-type';
export * from './modules/betting/domain/value-objects/odds';
export * from './modules/betting/domain/repositories/bets-repository';
export * from './modules/betting/application/use-cases/place-bet';

// Leagues module
export * from './modules/leagues/domain/entities/league';
export * from './modules/leagues/domain/entities/league-member';
export * from './modules/leagues/domain/value-objects/league-id';
export * from './modules/leagues/domain/value-objects/league-code';
export * from './modules/leagues/domain/value-objects/member-role';
export * from './modules/leagues/domain/repositories/leagues-repository';
export * from './modules/leagues/application/use-cases/create-league';
export * from './modules/leagues/application/use-cases/join-league';
export * from './modules/leagues/application/use-cases/get-league-ranking';
export * from './modules/leagues/application/use-cases/get-user-leagues';
export * from './modules/leagues/application/use-cases/get-league-details';
export * from './modules/leagues/application/use-cases/leave-league';
export * from './modules/leagues/application/use-cases/update-member-stats';
export * from './modules/leagues/application/use-cases/create-league-invite';
export * from './modules/leagues/application/use-cases/invite-user-by-username';
export * from './modules/leagues/application/use-cases/update-league';
export * from './modules/leagues/domain/entities/league-invite';
export * from './modules/leagues/domain/repositories/league-invites-repository';

// Matches module
export * from './modules/matches/domain/entities/match';
export * from './modules/matches/domain/entities/match-result';
export * from './modules/matches/domain/value-objects/match-id';
export * from './modules/matches/domain/value-objects/match-status';
export * from './modules/matches/domain/value-objects/team-id';
export * from './modules/matches/domain/repositories/matches-repository';
export * from './modules/matches/domain/services/football-api-service';
export * from './modules/matches/application/use-cases/sync-brasileirao-data';
export * from './modules/matches/application/use-cases/sync-teams';

// Wallet module
export * from './modules/wallet/domain/entities/wallet';
export * from './modules/wallet/domain/value-objects/wallet-id';
export * from './modules/wallet/domain/value-objects/balance';
export * from './modules/wallet/domain/repositories/wallets-repository';

// Notifications module
export * from './modules/notifications/domain/entities/notification';
export * from './modules/notifications/domain/repositories/notifications-repository';
export * from './modules/notifications/application/use-cases/create-notification';
export * from './modules/notifications/application/use-cases/get-user-notifications';
export * from './modules/notifications/application/use-cases/mark-notification-read';

// Auth value objects (legacy location)
export * from './modules/auth/domain/value-objects/user-id';