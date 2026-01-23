import { UpdateTowerUseCase } from '@/contexts/towers/application/usecases/update-tower.usecase';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';
import { Tower } from '@/contexts/towers/domain/tower.entity';

describe('UpdateTowerUseCase', () => {
  let useCase: UpdateTowerUseCase;
  let mockRepository: jest.Mocked<TowersRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateTowerUseCase(mockRepository);
  });

  it('should update tower with provided fields', async () => {
    const input = {
      id: 'tower-id-123',
      code: 5,
      tower: 'T-005',
      type: 'anchor',
      coordinates: { lat: -23.60, lng: -46.70, altitude: 50 },
      distance: 200,
      height: 40,
      weight: 7000,
      embargo: 'environmental',
      foundations: ['foundation-1'],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    };

    const updatedTower = new Tower({
      id: 'tower-id-123',
      code: 5,
      tower_number: 'T-005',
      type: 'anchor',
      coordinates: { lat: -23.60, lng: -46.70, altitude: 50 },
      distance: 200,
      height: 40,
      weight: 7000,
      embargo: 'environmental',
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    mockRepository.update.mockResolvedValue(updatedTower);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('tower-id-123', {
      code: 5,
      tower_number: 'T-005',
      type: 'anchor',
      coordinates: { lat: -23.60, lng: -46.70, altitude: 50 },
      distance: 200,
      height: 40,
      weight: 7000,
      embargo: 'environmental',
      foundations: ['foundation-1'],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    expect(result.code).toBe(5);
    expect(result.tower).toBe('T-005');
    expect(result.type).toBe('anchor');
    expect(result.deflection).toBe(0);
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'tower-id-123',
      height: 50,
    };

    const updatedTower = new Tower({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: 100,
      height: 50,
      weight: 5000,
      embargo: null,
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    mockRepository.update.mockResolvedValue(updatedTower);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('tower-id-123', {
      height: 50,
    });

    expect(result.height).toBe(50);
  });

  it('should handle null values for optional fields', async () => {
    const input = {
      id: 'tower-id-123',
      distance: null,
      height: null,
      embargo: null,
    };

    const updatedTower = new Tower({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: null,
      height: null,
      weight: 5000,
      embargo: null,
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    mockRepository.update.mockResolvedValue(updatedTower);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('tower-id-123', {
      distance: null,
      height: null,
      embargo: null,
    });

    expect(result.distance).toBeNull();
    expect(result.height).toBeNull();
    expect(result.height).toBeNull();
    expect(result.embargo).toBeNull();
  });
});
