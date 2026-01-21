import { ListFoundationsUseCase } from '@/contexts/foundations/application/usecases/list-foundations.usecase';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';
import { Foundation } from '@/contexts/foundations/domain/foundation.entity';

describe('ListFoundationsUseCase', () => {
  let useCase: ListFoundationsUseCase;
  let mockRepository: jest.Mocked<FoundationsRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListFoundationsUseCase(mockRepository);
  });

  it('should return paginated foundations with meta', async () => {
    const foundations = [
      new Foundation({
        id: 'found-1',
        project: 'Project A',
        revision: 'Rev 1.0',
        description: 'Foundation 1',
        excavation_volume: 100,
        concrete_volume: 50,
        backfill_volume: 30,
        steel_volume: 5,
        createdAt: mockDate,
      }),
      new Foundation({
        id: 'found-2',
        project: 'Project B',
        revision: 'Rev 2.0',
        description: 'Foundation 2',
        excavation_volume: null,
        concrete_volume: null,
        backfill_volume: null,
        steel_volume: null,
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: foundations });

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
    expect(result.data[0]!.project).toBe('Project A');
    expect(result.data[1]!.project).toBe('Project B');
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
