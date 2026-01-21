import { CreateTaskUseCase } from '@/contexts/task/application/usecases/create-task.usecase';
import { TaskRepository } from '@/contexts/task/domain/task.repository';
import { TaskEntity } from '@/contexts/task/domain/task.entity';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
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
    useCase = new CreateTaskUseCase(mockRepository);
  });

  it('should create a task with all fields', async () => {
    const input = {
      code: 1,
      stage: 'Stage 1',
      group: 'Group A',
      name: 'Foundation Work',
      unit: 'm3',
    };

    const createdTask = new TaskEntity({
      id: 'task-id-123',
      code: 1,
      stage: 'Stage 1',
      group: 'Group A',
      name: 'Foundation Work',
      unit: 'm3',
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdTask);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      code: 1,
      stage: 'Stage 1',
      group: 'Group A',
      name: 'Foundation Work',
      unit: 'm3',
    });

    expect(result).toEqual({
      id: 'task-id-123',
      code: 1,
      stage: 'Stage 1',
      group: 'Group A',
      name: 'Foundation Work',
      unit: 'm3',
      created_at: mockDate,
    });
  });
});
