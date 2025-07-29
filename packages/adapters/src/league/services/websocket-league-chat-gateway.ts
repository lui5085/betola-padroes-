import { ILeagueChatGateway, ChatMessage } from '@betola/core';
import { LeagueId } from '@betola/core/shared/types/league-id';
import { UserId } from '@betola/core/shared/types/user-id';

export class WebSocketLeagueChatGateway implements ILeagueChatGateway {
    async sendMessage(leagueId: LeagueId, userId: UserId, message: string): Promise<void> {
        // TODO: Implementar integração com WebSocket
        console.log(`Sending message to league ${leagueId.value} from user ${userId.value}: ${message}`);
    }

    subscribe(leagueId: LeagueId, userId: UserId): AsyncIterator<ChatMessage> {
        // TODO: Implementar subscription WebSocket
        console.log(`User ${userId.value} subscribing to league ${leagueId.value}`);

        // Retornar um AsyncIterator vazio por enquanto
        return {
            next: async () => ({ value: undefined, done: true }),
            return: async () => ({ value: undefined, done: true }),
            throw: async () => ({ value: undefined, done: true }),
        };
    }

    async unsubscribe(leagueId: LeagueId, userId: UserId): Promise<void> {
        // TODO: Implementar unsubscription WebSocket
        console.log(`User ${userId.value} unsubscribing from league ${leagueId.value}`);
    }
} 