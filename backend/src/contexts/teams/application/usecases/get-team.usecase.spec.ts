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
    const mockEmployees = [
      { id: 'emp-1', registration: '123', full_name: 'John Doe', occupation: 'Worker' },
      { id: 'emp-2', registration: '456', full_name: 'Jane Doe', occupation: 'Engineer' }
    ];
    const mockEquipments = [
      { id: 'eq-1', model: 'Model X', manufacturer: 'Maker', license_plate: 'ABC-1234' }
    ];

    const team = new Team({
      id: 'team-id-123',
      name: 'Team Alpha',
      employees: mockEmployees,
      equipments: mockEquipments,
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(team);

    const result = await useCase.execute({ id: 'team-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('team-id-123');
    expect(result.name).toBe('Team Alpha');
    expect(result.employees).toEqual(mockEmployees);
  });

  it('should throw NotFoundError when team not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Team not found');
  });
});
