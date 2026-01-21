import { DeleteTowerUseCase } from '@/contexts/towers/application/usecases/delete-tower.usecase';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';

describe('DeleteTowerUseCase', () => {
  let useCase: DeleteTowerUseCase;
  let mockRepository: jest.Mocked<TowersRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteTowerUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'tower-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('tower-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'tower-id-123' })).rejects.toThrow('Database error');
  });
});
