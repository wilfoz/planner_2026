import { UpdateTeamUseCase } from '@/contexts/teams/application/usecases/update-team.usecase';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';
import { Team } from '@/contexts/teams/domain/team.entity';

describe('UpdateTeamUseCase', () => {
  let useCase: UpdateTeamUseCase;
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
    useCase = new UpdateTeamUseCase(mockRepository);
  });

  it('should update team with provided fields', async () => {
    const input = {
      id: 'team-id-123',
      name: 'Updated Team Name',
      employees: ['emp-1', 'emp-2', 'emp-3'],
    };

    const updatedTeam = new Team({
      id: 'team-id-123',
      name: 'Updated Team Name',
      employees: ['emp-1', 'emp-2', 'emp-3'],
      equipments: ['eq-1'],
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedTeam);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('team-id-123', {
      id: 'team-id-123',
      name: 'Updated Team Name',
      employees: ['emp-1', 'emp-2', 'emp-3'],
    });

    expect(result.name).toBe('Updated Team Name');
    expect(result.employees).toHaveLength(3);
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'team-id-123',
      equipments: ['eq-2', 'eq-3'],
    };

    const updatedTeam = new Team({
      id: 'team-id-123',
      name: 'Team Alpha',
      employees: ['emp-1'],
      equipments: ['eq-2', 'eq-3'],
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedTeam);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('team-id-123', {
      id: 'team-id-123',
      equipments: ['eq-2', 'eq-3'],
    });

    expect(result.equipments).toEqual(['eq-2', 'eq-3']);
  });
});
