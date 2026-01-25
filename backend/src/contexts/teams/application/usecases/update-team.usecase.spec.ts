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

    const mockEmployees = [
      { id: 'emp-1', registration: '1', full_name: 'Name 1', occupation: 'Occ 1' },
      { id: 'emp-2', registration: '2', full_name: 'Name 2', occupation: 'Occ 2' },
      { id: 'emp-3', registration: '3', full_name: 'Name 3', occupation: 'Occ 3' }
    ];
    const mockEquipments = [
      { id: 'eq-1', model: 'Model X', manufacturer: 'Maker', license_plate: 'ABC-1234' }
    ];

    const updatedTeam = new Team({
      id: 'team-id-123',
      name: 'Updated Team Name',
      employees: mockEmployees,
      equipments: mockEquipments,
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedTeam);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalled();
    expect(result.name).toBe('Updated Team Name');
    expect(result.employees).toHaveLength(3);
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'team-id-123',
      equipments: ['eq-2', 'eq-3'],
    };

    const mockEmployees = [
      { id: 'emp-1', registration: '1', full_name: 'Name 1', occupation: 'Occ 1' }
    ];
    const mockEquipments = [
      { id: 'eq-2', model: 'Model 2', manufacturer: 'Maker', license_plate: 'ABC-2' },
      { id: 'eq-3', model: 'Model 3', manufacturer: 'Maker', license_plate: 'ABC-3' }
    ];

    const updatedTeam = new Team({
      id: 'team-id-123',
      name: 'Team Alpha',
      employees: mockEmployees,
      equipments: mockEquipments,
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedTeam);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalled();
    expect(result.equipments).toEqual(mockEquipments);
  });
});
