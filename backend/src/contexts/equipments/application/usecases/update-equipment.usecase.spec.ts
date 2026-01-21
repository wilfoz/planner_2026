import { UpdateEquipmentUseCase } from '@/contexts/equipments/application/usecases/update-equipment.usecase';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';
import { Equipment } from '@/contexts/equipments/domain/equipment.entity';
import { STATUS_EQUIPMENT } from '@prisma/client';

describe('UpdateEquipmentUseCase', () => {
  let useCase: UpdateEquipmentUseCase;
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
    useCase = new UpdateEquipmentUseCase(mockRepository);
  });

  it('should update equipment with provided fields', async () => {
    const input = {
      id: 'equipment-id-123',
      model: 'Excavator X200',
      status: STATUS_EQUIPMENT.ACTIVE,
    };

    const updatedEquipment = new Equipment({
      id: 'equipment-id-123',
      registration: 'EQ001',
      model: 'Excavator X200',
      manufacturer: 'Caterpillar',
      license_plate: 'ABC-1234',
      provider: 'Heavy Equipment Inc',
      status: STATUS_EQUIPMENT.ACTIVE,
      team_id: 'team-123',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedEquipment);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('equipment-id-123', {
      model: 'Excavator X200',
      status: STATUS_EQUIPMENT.ACTIVE,
    });

    expect(result.model).toBe('Excavator X200');
    expect(result.status).toBe(STATUS_EQUIPMENT.ACTIVE);
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'equipment-id-123',
      provider: 'New Provider',
    };

    const updatedEquipment = new Equipment({
      id: 'equipment-id-123',
      registration: 'EQ001',
      model: 'Excavator X100',
      manufacturer: 'Caterpillar',
      license_plate: 'ABC-1234',
      provider: 'New Provider',
      status: STATUS_EQUIPMENT.ACTIVE,
      team_id: 'team-123',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedEquipment);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('equipment-id-123', {
      provider: 'New Provider',
    });

    expect(result.provider).toBe('New Provider');
  });
});
