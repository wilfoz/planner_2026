import { GetTeamUseCase } from '@/contexts/teams/application/usecases/get-team.usecase';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';
import { Team } from '@/contexts/teams/domain/team.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';

describe('GetTeamUseCase', () => {
  let useCase: GetTeamUseCase;
  let mockRepository: jest.Mocked<TeamsRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetTeamUseCase(mockRepository);
  });

  it('should return team when found', async () => {
    const team = new Team({
      id: 'team-id-123',
      name: 'Team Alpha',
      employees: ['emp-1', 'emp-2'],
      equipments: ['eq-1'],
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(team);

    const result = await useCase.execute({ id: 'team-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('team-id-123');
    expect(result.name).toBe('Team Alpha');
    expect(result.employees).toEqual(['emp-1', 'emp-2']);
  });

  it('should throw NotFoundError when team not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Team not found');
  });
});
