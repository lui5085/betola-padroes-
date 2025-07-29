import { League } from './league';
import { Title } from '../../../shared/types/title';
import { Description } from '../../../shared/types/description';
import { ImageUrl } from '../../../shared/types/image-url';
import { UserId } from '../../../shared/types/user-id';
import { LeagueId } from '../../../shared/types/league-id';
import { Timestamp } from '../../../shared/types/timestamp';

describe('League', () => {
    const mockUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');
    const mockTitle = new Title('My League');
    const mockDescription = Description.create('A test league');
    const mockImageUrl = ImageUrl.create('https://example.com/image.jpg');

    describe('constructor', () => {
        it('should create a League with all required properties', () => {
            const league = new League({
                title: mockTitle,
                description: mockDescription,
                imageUrl: mockImageUrl,
                ownerId: mockUserId,
            });

            expect(league.title).toBe(mockTitle);
            expect(league.description).toBe(mockDescription);
            expect(league.imageUrl).toBe(mockImageUrl);
            expect(league.ownerId).toBe(mockUserId);
            expect(league.createdAt).toBeInstanceOf(Timestamp);
            expect(league.updatedAt).toBeInstanceOf(Timestamp);
            expect(league.id).toBeInstanceOf(LeagueId);
        });

        it('should generate a new LeagueId if not provided', () => {
            const league1 = new League({
                title: mockTitle,
                description: mockDescription,
                imageUrl: mockImageUrl,
                ownerId: mockUserId,
            });

            const league2 = new League({
                title: mockTitle,
                description: mockDescription,
                imageUrl: mockImageUrl,
                ownerId: mockUserId,
            });

            expect(league1.id.value).not.toBe(league2.id.value);
        });

        it('should use provided LeagueId if provided', () => {
            const customId = new LeagueId('550e8400-e29b-41d4-a716-446655440001');

            const league = new League({
                title: mockTitle,
                description: mockDescription,
                imageUrl: mockImageUrl,
                ownerId: mockUserId,
            }, customId);

            expect(league.id).toBe(customId);
        });

        it('should use provided timestamps if provided', () => {
            const customCreatedAt = new Timestamp(new Date('2024-01-01'));
            const customUpdatedAt = new Timestamp(new Date('2024-01-02'));

            const league = new League({
                title: mockTitle,
                description: mockDescription,
                imageUrl: mockImageUrl,
                ownerId: mockUserId,
            }, undefined, customCreatedAt, customUpdatedAt);

            expect(league.createdAt).toBe(customCreatedAt);
            expect(league.updatedAt).toBe(customUpdatedAt);
        });

        it('should generate current timestamps if not provided', () => {
            const beforeCreation = new Date();

            const league = new League({
                title: mockTitle,
                description: mockDescription,
                imageUrl: mockImageUrl,
                ownerId: mockUserId,
            });

            const afterCreation = new Date();

            expect(league.createdAt.value.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
            expect(league.createdAt.value.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
            expect(league.updatedAt.value.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
            expect(league.updatedAt.value.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
        });
    });
}); 