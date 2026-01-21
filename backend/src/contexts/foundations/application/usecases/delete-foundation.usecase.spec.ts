import { DeleteFoundationUseCase } from '@/contexts/foundations/application/usecases/delete-foundation.usecase';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';

describe('DeleteFoundationUseCase', () => {
  let useCase: DeleteFoundationUseCase;
  let mockRepository: jest.Mocked<FoundationsRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteFoundationUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'foundation-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('foundation-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'foundation-id-123' })).rejects.toThrow('Database error');
  });
});
