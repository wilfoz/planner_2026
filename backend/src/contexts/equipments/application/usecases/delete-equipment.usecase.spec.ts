import { DeleteEquipmentUseCase } from '@/contexts/equipments/application/usecases/delete-equipment.usecase';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';

describe('DeleteEquipmentUseCase', () => {
  let useCase: DeleteEquipmentUseCase;
  let mockRepository: jest.Mocked<EquipmentsRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteEquipmentUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'equipment-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('equipment-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'equipment-id-123' })).rejects.toThrow('Database error');
  });
});
