import { CreateTowerUseCase } from '@/contexts/towers/application/usecases/create-tower.usecase';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';
import { Tower } from '@/contexts/towers/domain/tower.entity';

describe('CreateTowerUseCase', () => {
  let useCase: CreateTowerUseCase;
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
    useCase = new CreateTowerUseCase(mockRepository);
  });

  it('should create a tower with all fields', async () => {
    const input = {
      code: 1,
      tower: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: 100.5,
      height: 30,
      weight: 5000,
      embargo: 'none',
      work_id: 'work-123',
      foundations: ['foundation-1', 'foundation-2'],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    };

    const createdTower = new Tower({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: 100.5,
      height: 30,
      weight: 5000,
      embargo: 'none',
      work_id: 'work-123',
      createdAt: mockDate,
      foundations: [],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    mockRepository.create.mockResolvedValue(createdTower);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      code: 1,
      tower_number: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: 100.5,
      height: 30,
      weight: 5000,
      embargo: 'none',
      work_id: 'work-123',
      foundations: ['foundation-1', 'foundation-2'],
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });

    expect(result).toEqual({
      id: 'tower-id-123',
      code: 1,
      tower: 'T-001',
      type: 'suspension',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: 100.5,
      height: 30,
      weight: 5000,
      embargo: 'none',
      foundations: [],
      created_at: mockDate,
      deflection: 0,
      structureType: 'suspension',
      color: 'red',
      isHidden: false,
    });
  });

  it('should create a tower with optional fields as null', async () => {
    const input = {
      code: 2,
      tower: 'T-002',
      type: 'anchor',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      work_id: 'work-456',
    };

    const createdTower = new Tower({
      id: 'tower-id-456',
      code: 2,
      tower_number: 'T-002',
      type: 'anchor',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: null,
      height: null,
      weight: null,
      embargo: null,
      work_id: 'work-456',
      createdAt: mockDate,
      foundations: [],
      deflection: null,
      structureType: null,
      color: null,
      isHidden: false,
    });

    mockRepository.create.mockResolvedValue(createdTower);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      code: 2,
      tower_number: 'T-002',
      type: 'anchor',
      coordinates: { lat: -23.55, lng: -46.63, altitude: 0 },
      distance: null,
      height: null,
      weight: null,
      embargo: null,
      work_id: 'work-456',
      foundations: undefined,
      deflection: null,
      structureType: null,
      color: null,
      isHidden: false,
    });

    expect(result.distance).toBeNull();
    expect(result.height).toBeNull();
    expect(result.weight).toBeNull();
    expect(result.embargo).toBeNull();
    expect(result.deflection).toBeNull();
    expect(result.structureType).toBeNull();
    expect(result.color).toBeNull();
    expect(result.isHidden).toBe(false);
  });
});
