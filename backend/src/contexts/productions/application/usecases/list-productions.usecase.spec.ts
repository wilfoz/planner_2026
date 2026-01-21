import { ListProductionsUseCase } from '@/contexts/productions/application/usecases/list-productions.usecase';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';
import { ProductionEntity } from '@/contexts/productions/domain/production.entity';
import { STATUS_PRODUCTION } from '@prisma/client';

describe('ListProductionsUseCase', () => {
  let useCase: ListProductionsUseCase;
  let mockRepository: jest.Mocked<ProductionsRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addTeam: jest.fn(),
      delTeam: jest.fn(),
      addTower: jest.fn(),
      delTower: jest.fn(),
    };
    useCase = new ListProductionsUseCase(mockRepository);
  });

  it('should return paginated productions with meta', async () => {
    const productions = [
      new ProductionEntity({
        id: 'prod-1',
        status: STATUS_PRODUCTION.PROGRESS,
        comments: 'Comment 1',
        start_time: mockDate,
        final_time: null,
        task_id: 'task-1',
        work_id: 'work-1',
        teams: ['team-1'],
        towers: ['tower-1'],
        createdAt: mockDate,
      }),
      new ProductionEntity({
        id: 'prod-2',
        status: STATUS_PRODUCTION.EXECUTED,
        comments: 'Comment 2',
        start_time: mockDate,
        final_time: mockDate,
        task_id: 'task-2',
        work_id: 'work-1',
        teams: [],
        towers: [],
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: productions });

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
    expect(result.data[0]!.status).toBe(STATUS_PRODUCTION.PROGRESS);
    expect(result.data[1]!.status).toBe(STATUS_PRODUCTION.EXECUTED);
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
