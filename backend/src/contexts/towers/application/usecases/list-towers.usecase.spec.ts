import { ListTowersUseCase } from '@/contexts/towers/application/usecases/list-towers.usecase';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';
import { Tower } from '@/contexts/towers/domain/tower.entity';

describe('ListTowersUseCase', () => {
  let useCase: ListTowersUseCase;
  let mockRepository: jest.Mocked<TowersRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListTowersUseCase(mockRepository);
  });

  it('should return paginated towers with meta', async () => {
    const towers = [
      new Tower({
        id: 'tower-1',
        code: 1,
        tower_number: 'T-001',
        type: 'suspension',
        coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
        distance: 100,
        height: 30,
        weight: 5000,
        embargo: null,
        work_id: 'work-123',
        createdAt: mockDate,
        foundations: [],
        deflection: 0,
        structureType: 'suspension',
        color: 'red',
        isHidden: false,
      }),
      new Tower({
        id: 'tower-2',
        code: 2,
        tower_number: 'T-002',
        type: 'anchor',
        coordinates: { lat: -23.56, lng: -46.64, altitude: 0 },
        distance: 150,
        height: 35,
        weight: 6000,
        embargo: null,
        work_id: 'work-123',
        createdAt: mockDate,
        foundations: [],
        deflection: 0,
        structureType: 'suspension',
        color: 'red',
        isHidden: false,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: towers });

    const result = await useCase.execute({ page: 1, per_page: 10 });

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.per_page).toBe(10);
    expect(result.meta.total).toBe(2);
    expect(result.meta.last_page).toBe(1);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]!.tower).toBe('T-001');
    expect(result.data[1]!.tower).toBe('T-002');
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

  it('should calculate last_page correctly', async () => {
    mockRepository.list.mockResolvedValue({ total: 25, items: [] });

    const result = await useCase.execute({ page: 1, per_page: 10 });

    expect(result.meta.last_page).toBe(3);
  });
});
