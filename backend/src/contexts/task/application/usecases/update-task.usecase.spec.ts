import { UpdateTaskUseCase } from '@/contexts/task/application/usecases/update-task.usecase';
import { TaskRepository } from '@/contexts/task/domain/task.repository';
import { TaskEntity } from '@/contexts/task/domain/task.entity';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
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
    useCase = new UpdateTaskUseCase(mockRepository);
  });

  it('should update task with provided fields', async () => {
    const input = {
      id: 'task-id-123',
      name: 'Updated Task Name',
      unit: 'kg',
    };

    const updatedTask = new TaskEntity({
      id: 'task-id-123',
      code: 1,
      stage: 'Stage 1',
      group: 'Group A',
      name: 'Updated Task Name',
      unit: 'kg',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedTask);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('task-id-123', {
      name: 'Updated Task Name',
      unit: 'kg',
    });

    expect(result.name).toBe('Updated Task Name');
    expect(result.unit).toBe('kg');
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'task-id-123',
      stage: 'Stage 2',
    };

    const updatedTask = new TaskEntity({
      id: 'task-id-123',
      code: 1,
      stage: 'Stage 2',
      group: 'Group A',
      name: 'Task 1',
      unit: 'm3',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedTask);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('task-id-123', {
      stage: 'Stage 2',
    });

    expect(result.stage).toBe('Stage 2');
  });
});
