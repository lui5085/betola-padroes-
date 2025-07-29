import { ChatMessage } from './chat-message';
import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';

describe('ChatMessage', () => {
    const mockLeagueId = new LeagueId('550e8400-e29b-41d4-a716-446655440000');
    const mockUserId = new UserId('550e8400-e29b-41d4-a716-446655440001');
    const mockMessage = 'Hello, this is a test message!';

    describe('constructor', () => {
        it('should create a ChatMessage with all required properties', () => {
            const chatMessage = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: mockMessage,
            });

            expect(chatMessage.leagueId).toBe(mockLeagueId);
            expect(chatMessage.userId).toBe(mockUserId);
            expect(chatMessage.message).toBe(mockMessage);
            expect(chatMessage.createdAt).toBeInstanceOf(Timestamp);
            expect(chatMessage.id).toBeDefined();
        });

        it('should generate a new id if not provided', () => {
            const message1 = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: mockMessage,
            });

            const message2 = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: mockMessage,
            });

            expect(message1.id).not.toBe(message2.id);
        });

        it('should use provided id if provided', () => {
            const customId = 'custom-message-id-123';

            const chatMessage = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: mockMessage,
            }, customId);

            expect(chatMessage.id).toBe(customId);
        });

        it('should use provided createdAt if provided', () => {
            const customCreatedAt = new Timestamp(new Date('2024-01-01'));

            const chatMessage = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: mockMessage,
            }, undefined, customCreatedAt);

            expect(chatMessage.createdAt).toBe(customCreatedAt);
        });

        it('should generate current timestamp for createdAt if not provided', () => {
            const beforeCreation = new Date();

            const chatMessage = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: mockMessage,
            });

            const afterCreation = new Date();

            expect(chatMessage.createdAt.value.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
            expect(chatMessage.createdAt.value.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
        });

        it('should handle empty message', () => {
            const emptyMessage = '';

            const chatMessage = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: emptyMessage,
            });

            expect(chatMessage.message).toBe(emptyMessage);
        });

        it('should handle long message', () => {
            const longMessage = 'a'.repeat(1000);

            const chatMessage = new ChatMessage({
                leagueId: mockLeagueId,
                userId: mockUserId,
                message: longMessage,
            });

            expect(chatMessage.message).toBe(longMessage);
        });
    });
}); 