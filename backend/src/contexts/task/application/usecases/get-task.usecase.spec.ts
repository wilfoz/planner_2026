import { GetTaskUseCase } from '@/contexts/task/application/usecases/get-task.usecase';
import { TaskRepository } from '@/contexts/task/domain/task.repository';
import { TaskEntity } from '@/contexts/task/domain/task.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';

describe('GetTaskUseCase', () => {
  let useCase: GetTaskUseCase;
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
    useCase = new GetTaskUseCase(mockRepository);
  });

  it('should return task when found', async () => {
    const task = new TaskEntity({
      id: 'task-id-123',
      code: 1,
      stage: 'Stage 1',
      group: 'Group A',
      name: 'Foundation Work',
      unit: 'm3',
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(task);

    const result = await useCase.execute({ id: 'task-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('task-id-123');
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

  it('should throw NotFoundError when task not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Task not found');
  });
});
