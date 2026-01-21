import { GetEquipmentUseCase } from '@/contexts/equipments/application/usecases/get-equipment.usecase';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';
import { Equipment } from '@/contexts/equipments/domain/equipment.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { STATUS_EQUIPMENT } from '@prisma/client';

describe('GetEquipmentUseCase', () => {
  let useCase: GetEquipmentUseCase;
  let mockRepository: jest.Mocked<EquipmentsRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetEquipmentUseCase(mockRepository);
  });

  it('should return equipment when found', async () => {
    const equipment = new Equipment({
      id: 'equipment-id-123',
      registration: 'EQ001',
      model: 'Excavator X100',
      manufacturer: 'Caterpillar',
      license_plate: 'ABC-1234',
      provider: 'Heavy Equipment Inc',
      status: STATUS_EQUIPMENT.ACTIVE,
      team_id: 'team-123',
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(equipment);

    const result = await useCase.execute({ id: 'equipment-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('equipment-id-123');
    expect(result).toEqual({
      id: 'equipment-id-123',
      registration: 'EQ001',
      model: 'Excavator X100',
      manufacturer: 'Caterpillar',
      license_plate: 'ABC-1234',
      provider: 'Heavy Equipment Inc',
      status: STATUS_EQUIPMENT.ACTIVE,
      team_id: 'team-123',
      created_at: mockDate,
    });
  });

  it('should throw NotFoundError when equipment not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Equipment not found');
  });
});
