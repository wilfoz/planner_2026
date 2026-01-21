import { DeleteProductionUseCase } from '@/contexts/productions/application/usecases/delete-production.usecase';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';

describe('DeleteProductionUseCase', () => {
  let useCase: DeleteProductionUseCase;
  let mockRepository: jest.Mocked<ProductionsRepository>;

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
    useCase = new DeleteProductionUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'production-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('production-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'production-id-123' })).rejects.toThrow('Database error');
  });
});
