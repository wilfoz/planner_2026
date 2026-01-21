import { CreateTeamUseCase } from '@/contexts/teams/application/usecases/create-team.usecase';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';
import { Team } from '@/contexts/teams/domain/team.entity';

describe('CreateTeamUseCase', () => {
  let useCase: CreateTeamUseCase;
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
    useCase = new CreateTeamUseCase(mockRepository);
  });

  it('should create a team with all fields', async () => {
    const input = {
      name: 'Team Alpha',
      employees: ['emp-1', 'emp-2'],
      equipments: ['eq-1'],
    };

    const createdTeam = new Team({
      id: 'team-id-123',
      name: 'Team Alpha',
      employees: ['emp-1', 'emp-2'],
      equipments: ['eq-1'],
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdTeam);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      name: 'Team Alpha',
      employees: ['emp-1', 'emp-2'],
      equipments: ['eq-1'],
    });

    expect(result.name).toBe('Team Alpha');
    expect(result.employees).toEqual(['emp-1', 'emp-2']);
    expect(result.equipments).toEqual(['eq-1']);
  });

  it('should create a team with empty arrays', async () => {
    const input = {
      name: 'Team Beta',
      employees: [],
      equipments: [],
    };

    const createdTeam = new Team({
      id: 'team-id-456',
      name: 'Team Beta',
      employees: [],
      equipments: [],
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdTeam);

    const result = await useCase.execute(input);

    expect(result.employees).toEqual([]);
    expect(result.equipments).toEqual([]);
  });
});
