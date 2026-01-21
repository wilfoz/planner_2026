import { CreateFoundationUseCase } from '@/contexts/foundations/application/usecases/create-foundation.usecase';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';
import { Foundation } from '@/contexts/foundations/domain/foundation.entity';

describe('CreateFoundationUseCase', () => {
  let useCase: CreateFoundationUseCase;
  let mockRepository: jest.Mocked<FoundationsRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateFoundationUseCase(mockRepository);
  });

  it('should create a foundation with all fields', async () => {
    const input = {
      project: 'Project A',
      revision: 'Rev 1.0',
      description: 'Main tower foundation',
      excavation_volume: 100.5,
      concrete_volume: 50.25,
      backfill_volume: 30.0,
      steel_volume: 5.5,
    };

    const createdFoundation = new Foundation({
      id: 'foundation-id-123',
      project: 'Project A',
      revision: 'Rev 1.0',
      description: 'Main tower foundation',
      excavation_volume: 100.5,
      concrete_volume: 50.25,
      backfill_volume: 30.0,
      steel_volume: 5.5,
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdFoundation);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      project: 'Project A',
      revision: 'Rev 1.0',
      description: 'Main tower foundation',
      excavation_volume: 100.5,
      concrete_volume: 50.25,
      backfill_volume: 30.0,
      steel_volume: 5.5,
    });

    expect(result).toEqual({
      id: 'foundation-id-123',
      project: 'Project A',
      revision: 'Rev 1.0',
      description: 'Main tower foundation',
      excavation_volume: 100.5,
      concrete_volume: 50.25,
      backfill_volume: 30.0,
      steel_volume: 5.5,
      created_at: mockDate,
    });
  });

  it('should create a foundation with null optional fields', async () => {
    const input = {
      project: 'Project B',
      revision: 'Rev 2.0',
      description: 'Secondary foundation',
      excavation_volume: null,
      concrete_volume: null,
      backfill_volume: null,
      steel_volume: null,
    };

    const createdFoundation = new Foundation({
      id: 'foundation-id-456',
      project: 'Project B',
      revision: 'Rev 2.0',
      description: 'Secondary foundation',
      excavation_volume: null,
      concrete_volume: null,
      backfill_volume: null,
      steel_volume: null,
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdFoundation);

    const result = await useCase.execute(input);

    expect(result.excavation_volume).toBeNull();
    expect(result.concrete_volume).toBeNull();
    expect(result.backfill_volume).toBeNull();
    expect(result.steel_volume).toBeNull();
  });
});
