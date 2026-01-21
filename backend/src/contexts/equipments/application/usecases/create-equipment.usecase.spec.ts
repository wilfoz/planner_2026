import { CreateEquipmentUseCase } from '@/contexts/equipments/application/usecases/create-equipment.usecase';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';
import { Equipment } from '@/contexts/equipments/domain/equipment.entity';
import { STATUS_EQUIPMENT } from '@prisma/client';

describe('CreateEquipmentUseCase', () => {
  let useCase: CreateEquipmentUseCase;
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
    useCase = new CreateEquipmentUseCase(mockRepository);
  });

  it('should create an equipment with all fields', async () => {
    const input = {
      registration: 'EQ001',
      model: 'Excavator X100',
      manufacturer: 'Caterpillar',
      license_plate: 'ABC-1234',
      provider: 'Heavy Equipment Inc',
      status: STATUS_EQUIPMENT.ACTIVE,
      team_id: 'team-123',
    };

    const createdEquipment = new Equipment({
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

    mockRepository.create.mockResolvedValue(createdEquipment);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      registration: 'EQ001',
      model: 'Excavator X100',
      manufacturer: 'Caterpillar',
      license_plate: 'ABC-1234',
      provider: 'Heavy Equipment Inc',
      status: STATUS_EQUIPMENT.ACTIVE,
      team_id: 'team-123',
    });

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

  it('should create an equipment without team_id', async () => {
    const input = {
      registration: 'EQ002',
      model: 'Crane C200',
      manufacturer: 'Liebherr',
      license_plate: 'XYZ-5678',
      provider: 'Crane Services Ltd',
      status: STATUS_EQUIPMENT.MAINTENANCE,
      team_id: null,
    };

    const createdEquipment = new Equipment({
      id: 'equipment-id-456',
      registration: 'EQ002',
      model: 'Crane C200',
      manufacturer: 'Liebherr',
      license_plate: 'XYZ-5678',
      provider: 'Crane Services Ltd',
      status: STATUS_EQUIPMENT.MAINTENANCE,
      team_id: null,
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdEquipment);

    const result = await useCase.execute(input);

    expect(result.team_id).toBeNull();
  });
});
