import { ListTaskUseCase } from '@/contexts/task/application/usecases/list-task.usecase';
import { TaskRepository } from '@/contexts/task/domain/task.repository';
import { TaskEntity } from '@/contexts/task/domain/task.entity';

describe('ListTaskUseCase', () => {
  let useCase: ListTaskUseCase;
  let mockRepository: jest.Mocked<TaskRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListTaskUseCase(mockRepository);
  });

  it('should return paginated tasks with meta', async () => {
    const tasks = [
      new TaskEntity({
        id: 'task-1',
        code: 1,
        stage: 'Stage 1',
        group: 'Group A',
        name: 'Task 1',
        unit: 'm3',
        createdAt: mockDate,
      }),
      new TaskEntity({
        id: 'task-2',
        code: 2,
        stage: 'Stage 2',
        group: 'Group B',
        name: 'Task 2',
        unit: 'kg',
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: tasks });

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
    expect(result.data[0]!.name).toBe('Task 1');
    expect(result.data[1]!.name).toBe('Task 2');
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
