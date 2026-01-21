import { DeleteTaskUseCase } from '@/contexts/task/application/usecases/delete-task.usecase';
import { TaskRepository } from '@/contexts/task/domain/task.repository';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
  let mockRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteTaskUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'task-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('task-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'task-id-123' })).rejects.toThrow('Database error');
  });
});
