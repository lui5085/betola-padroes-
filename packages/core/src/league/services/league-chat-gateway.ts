import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { ChatMessage } from '../entities/chat-message';

export interface ILeagueChatGateway {
    sendMessage(leagueId: LeagueId, userId: UserId, message: string): Promise<void>;
    subscribe(leagueId: LeagueId, userId: UserId): AsyncIterator<ChatMessage>;
    unsubscribe(leagueId: LeagueId, userId: UserId): Promise<void>;
} 