import { CreateLeagueUseCase } from './create-league-use-case';
import { ILeagueRepository } from '../repositories/league-repository';
import { ILeagueParticipantRepository } from '../repositories/league-participant-repository';
import { League } from '../entities/league';
import { LeagueParticipant } from '../entities/league-participant';
import { Title } from '../../../shared/types/title';
import { Description } from '../../../shared/types/description';
import { ImageUrl } from '../../../shared/types/image-url';
import { UserId } from '../../../shared/types/user-id';
import { LeagueId } from '../../../shared/types/league-id';

describe('CreateLeagueUseCase', () => {
    let createLeagueUseCase: CreateLeagueUseCase;
    let mockLeagueRepository: jest.Mocked<ILeagueRepository>;
    let mockLeagueParticipantRepository: jest.Mocked<ILeagueParticipantRepository>;

    beforeEach(() => {
        mockLeagueRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByOwnerId: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };

        mockLeagueParticipantRepository = {
            create: jest.fn(),
            findByLeagueId: jest.fn(),
            findByUserId: jest.fn(),
            findByLeagueIdAndUserId: jest.fn(),
            delete: jest.fn(),
            countByLeagueId: jest.fn(),
        };

        createLeagueUseCase = new CreateLeagueUseCase(
            mockLeagueRepository,
            mockLeagueParticipantRepository,
        );
    });

    describe('execute', () => {
        it('should create a league with all required fields', async () => {
            const request = {
                title: 'My Test League',
                description: 'A test league description',
                imageUrl: 'https://example.com/image.jpg',
                ownerId: '550e8400-e29b-41d4-a716-446655440000',
            };

            const result = await createLeagueUseCase.execute(request);

            expect(result.league).toBeInstanceOf(League);
            expect(result.league.title.value).toBe(request.title);
            expect(result.league.description.value).toBe(request.description);
            expect(result.league.imageUrl.value).toBe(request.imageUrl);
            expect(result.league.ownerId.value).toBe(request.ownerId);

            expect(result.participant).toBeInstanceOf(LeagueParticipant);
            expect(result.participant.leagueId).toBe(result.league.id);
            expect(result.participant.userId.value).toBe(request.ownerId);

            expect(mockLeagueRepository.create).toHaveBeenCalledWith(result.league);
            expect(mockLeagueParticipantRepository.create).toHaveBeenCalledWith(result.participant);
        });

        it('should create a league with optional fields as null', async () => {
            const request = {
                title: 'My Test League',
                ownerId: '550e8400-e29b-41d4-a716-446655440000',
            };

            const result = await createLeagueUseCase.execute(request);

            expect(result.league.description.value).toBe(null);
            expect(result.league.imageUrl.value).toBe(null);
        });

            it('should create a league with empty string for optional fields', async () => {
      const request = {
        title: 'My Test League',
        description: '',
        imageUrl: null,
        ownerId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await createLeagueUseCase.execute(request);

      expect(result.league.description.value).toBe('');
      expect(result.league.imageUrl.value).toBe(null);
    });

        it('should automatically add owner as participant', async () => {
            const request = {
                title: 'My Test League',
                ownerId: '550e8400-e29b-41d4-a716-446655440000',
            };

            const result = await createLeagueUseCase.execute(request);

            expect(result.participant.leagueId).toBe(result.league.id);
            expect(result.participant.userId.value).toBe(request.ownerId);
            expect(mockLeagueParticipantRepository.create).toHaveBeenCalledWith(result.participant);
        });

        it('should throw error for invalid title', async () => {
            const request = {
                title: 'ab', // too short
                ownerId: '550e8400-e29b-41d4-a716-446655440000',
            };

            await expect(createLeagueUseCase.execute(request)).rejects.toThrow();
        });

        it('should throw error for invalid ownerId', async () => {
            const request = {
                title: 'My Test League',
                ownerId: 'invalid-uuid',
            };

            await expect(createLeagueUseCase.execute(request)).rejects.toThrow();
        });

        it('should throw error for invalid imageUrl', async () => {
            const request = {
                title: 'My Test League',
                imageUrl: 'not-a-valid-url',
                ownerId: '550e8400-e29b-41d4-a716-446655440000',
            };

            await expect(createLeagueUseCase.execute(request)).rejects.toThrow();
        });
    });
}); 