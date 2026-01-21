import { DeleteWorkUseCase } from '@/contexts/works/application/usecases/delete-work.usecase';
import { WorksRepository } from '@/contexts/works/domain/works.repository';

describe('DeleteWorkUseCase', () => {
  let useCase: DeleteWorkUseCase;
  let mockRepository: jest.Mocked<WorksRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteWorkUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('work-id-123');

    expect(mockRepository.delete).toHaveBeenCalledWith('work-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute('work-id-123')).rejects.toThrow('Database error');
  });
});
