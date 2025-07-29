import { JoinLeagueUseCase } from './join-league-use-case';
import { ILeagueRepository } from '../repositories/league-repository';
import { ILeagueParticipantRepository } from '../repositories/league-participant-repository';
import { League } from '../entities/league';
import { LeagueParticipant } from '../entities/league-participant';
import { LeagueNotFoundError } from './errors/league-not-found-error';
import { LeagueFullError } from './errors/league-full-error';
import { UserAlreadyInLeagueError } from './errors/user-already-in-league-error';
import { Title } from '../../../shared/types/title';
import { Description } from '../../../shared/types/description';
import { ImageUrl } from '../../../shared/types/image-url';
import { UserId } from '../../../shared/types/user-id';
import { LeagueId } from '../../../shared/types/league-id';

describe('JoinLeagueUseCase', () => {
    let joinLeagueUseCase: JoinLeagueUseCase;
    let mockLeagueRepository: jest.Mocked<ILeagueRepository>;
    let mockLeagueParticipantRepository: jest.Mocked<ILeagueParticipantRepository>;

    const mockUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');
    const mockLeagueId = new LeagueId('550e8400-e29b-41d4-a716-446655440001');
    const mockLeague = new League({
        title: new Title('Test League'),
        description: Description.create('Test description'),
        imageUrl: ImageUrl.create('https://example.com/image.jpg'),
        ownerId: mockUserId,
    }, mockLeagueId);

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

        joinLeagueUseCase = new JoinLeagueUseCase(
            mockLeagueRepository,
            mockLeagueParticipantRepository,
        );
    });

    describe('execute', () => {
        it('should join a league successfully', async () => {
            const request = {
                leagueId: mockLeagueId.value,
                userId: '550e8400-e29b-41d4-a716-446655440002',
            };

            mockLeagueRepository.findById.mockResolvedValue(mockLeague);
            mockLeagueParticipantRepository.findByLeagueIdAndUserId.mockResolvedValue(null);
            mockLeagueParticipantRepository.countByLeagueId.mockResolvedValue(50);

            const result = await joinLeagueUseCase.execute(request);

            expect(result.league).toBe(mockLeague);
            expect(result.participant).toBeInstanceOf(LeagueParticipant);
            expect(result.participant.leagueId.value).toBe(mockLeagueId.value);
            expect(result.participant.userId.value).toBe(request.userId);
            expect(mockLeagueParticipantRepository.create).toHaveBeenCalledWith(result.participant);
        });

        it('should throw LeagueNotFoundError when league does not exist', async () => {
            const request = {
                leagueId: '550e8400-e29b-41d4-a716-446655440001',
                userId: '550e8400-e29b-41d4-a716-446655440002',
            };

            mockLeagueRepository.findById.mockResolvedValue(null);

            await expect(joinLeagueUseCase.execute(request)).rejects.toThrow(LeagueNotFoundError);
        });

        it('should throw UserAlreadyInLeagueError when user is already in league', async () => {
            const request = {
                leagueId: mockLeagueId.value,
                userId: '550e8400-e29b-41d4-a716-446655440002',
            };

            const existingParticipant = new LeagueParticipant({
                leagueId: mockLeagueId,
                userId: new UserId(request.userId),
            });

            mockLeagueRepository.findById.mockResolvedValue(mockLeague);
            mockLeagueParticipantRepository.findByLeagueIdAndUserId.mockResolvedValue(existingParticipant);

            await expect(joinLeagueUseCase.execute(request)).rejects.toThrow(UserAlreadyInLeagueError);
        });

        it('should throw LeagueFullError when league is full', async () => {
            const request = {
                leagueId: mockLeagueId.value,
                userId: '550e8400-e29b-41d4-a716-446655440002',
            };

            mockLeagueRepository.findById.mockResolvedValue(mockLeague);
            mockLeagueParticipantRepository.findByLeagueIdAndUserId.mockResolvedValue(null);
            mockLeagueParticipantRepository.countByLeagueId.mockResolvedValue(100);

            await expect(joinLeagueUseCase.execute(request)).rejects.toThrow(LeagueFullError);
        });

        it('should throw error for invalid leagueId', async () => {
            const request = {
                leagueId: 'invalid-uuid',
                userId: '550e8400-e29b-41d4-a716-446655440002',
            };

            await expect(joinLeagueUseCase.execute(request)).rejects.toThrow();
        });

        it('should throw error for invalid userId', async () => {
            const request = {
                leagueId: mockLeagueId.value,
                userId: 'invalid-uuid',
            };

            await expect(joinLeagueUseCase.execute(request)).rejects.toThrow();
        });
    });
}); 