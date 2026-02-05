import { GetTowerUseCase } from '@/contexts/towers/application/usecases/get-tower.usecase';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';
import { Tower } from '@/contexts/towers/domain/tower.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';

describe('GetTowerUseCase', () => {
  let useCase: GetTowerUseCase;
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
    useCase = new GetTowerUseCase(mockRepository);
  });

  it('should return tower when found', async () => {
    const tower = new Tower({
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

    mockRepository.findById.mockResolvedValue(tower);

    const result = await useCase.execute({ id: 'tower-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('tower-id-123');
    expect(result).toEqual({
      id: 'tower-id-123',
      code: 1,
      tower_number: 'T-001',
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
      work_id: 'work-123',
    });
  });

  it('should throw NotFoundError when tower not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Tower not found');
  });
});
