import { ListTeamsUseCase } from '@/contexts/teams/application/usecases/list-teams.usecase';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';
import { Team } from '@/contexts/teams/domain/team.entity';

describe('ListTeamsUseCase', () => {
  let useCase: ListTeamsUseCase;
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
    useCase = new ListTeamsUseCase(mockRepository);
  });

  it('should return paginated teams with meta', async () => {
    const teams = [
      new Team({
        id: 'team-1',
        name: 'Team Alpha',
        employees: [{ id: 'emp-1', registration: '123', full_name: 'John Doe', occupation: 'Worker' }],
        equipments: [{ id: 'eq-1', model: 'Model X', manufacturer: 'Maker', license_plate: 'ABC-1234' }],
        createdAt: mockDate,
      }),
      new Team({
        id: 'team-2',
        name: 'Team Beta',
        employees: [],
        equipments: [],
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: teams });

    const result = await useCase.execute({ page: 1, per_page: 10 });

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]!.name).toBe('Team Alpha');
    expect(result.data[1]!.name).toBe('Team Beta');
  });

  it('should use default pagination values', async () => {
    mockRepository.list.mockResolvedValue({ total: 0, items: [] });

    await useCase.execute({});

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });
  });
});
