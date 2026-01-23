import { ListWorksUseCase } from '@/contexts/works/application/usecases/list-works.usecase';
import { WorksRepository } from '@/contexts/works/domain/works.repository';
import { Work } from '@/contexts/works/domain/work.entity';

describe('ListWorksUseCase', () => {
  let useCase: ListWorksUseCase;
  let mockRepository: jest.Mocked<WorksRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListWorksUseCase(mockRepository);
  });

  it('should return paginated works with meta', async () => {
    const works = [
      new Work({
        id: 'work-1',
        name: 'Project A',
        tension: 500,
        extension: 150,
        start_date: mockDate,
        end_date: null,
        createdAt: mockDate,
      }),
      new Work({
        id: 'work-2',
        name: 'Project B',
        tension: 230,
        extension: 100,
        start_date: mockDate,
        end_date: mockDate,
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: works });

    const result = await useCase.execute({ page: 1, per_page: 10 });

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]!.name).toBe('Project A');
    expect(result.items[1]!.name).toBe('Project B');
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
