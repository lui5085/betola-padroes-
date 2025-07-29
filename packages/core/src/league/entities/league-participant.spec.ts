import { LeagueParticipant } from './league-participant';
import { LeagueId } from '../../../shared/types/league-id';
import { UserId } from '../../../shared/types/user-id';
import { Timestamp } from '../../../shared/types/timestamp';

describe('LeagueParticipant', () => {
    const mockLeagueId = new LeagueId('550e8400-e29b-41d4-a716-446655440000');
    const mockUserId = new UserId('550e8400-e29b-41d4-a716-446655440001');

    describe('constructor', () => {
        it('should create a LeagueParticipant with all required properties', () => {
            const participant = new LeagueParticipant({
                leagueId: mockLeagueId,
                userId: mockUserId,
            });

            expect(participant.leagueId).toBe(mockLeagueId);
            expect(participant.userId).toBe(mockUserId);
            expect(participant.joinedAt).toBeInstanceOf(Timestamp);
            expect(participant.id).toBeDefined();
        });

        it('should generate a new id if not provided', () => {
            const participant1 = new LeagueParticipant({
                leagueId: mockLeagueId,
                userId: mockUserId,
            });

            const participant2 = new LeagueParticipant({
                leagueId: mockLeagueId,
                userId: mockUserId,
            });

            expect(participant1.id).not.toBe(participant2.id);
        });

        it('should use provided id if provided', () => {
            const customId = 'custom-id-123';

            const participant = new LeagueParticipant({
                leagueId: mockLeagueId,
                userId: mockUserId,
            }, customId);

            expect(participant.id).toBe(customId);
        });

        it('should use provided joinedAt if provided', () => {
            const customJoinedAt = new Timestamp(new Date('2024-01-01'));

            const participant = new LeagueParticipant({
                leagueId: mockLeagueId,
                userId: mockUserId,
            }, undefined, customJoinedAt);

            expect(participant.joinedAt).toBe(customJoinedAt);
        });

        it('should generate current timestamp for joinedAt if not provided', () => {
            const beforeCreation = new Date();

            const participant = new LeagueParticipant({
                leagueId: mockLeagueId,
                userId: mockUserId,
            });

            const afterCreation = new Date();

            expect(participant.joinedAt.value.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
            expect(participant.joinedAt.value.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
        });
    });
}); 