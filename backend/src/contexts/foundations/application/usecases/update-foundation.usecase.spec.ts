import { UpdateFoundationUseCase } from '@/contexts/foundations/application/usecases/update-foundation.usecase';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';
import { Foundation } from '@/contexts/foundations/domain/foundation.entity';

describe('UpdateFoundationUseCase', () => {
  let useCase: UpdateFoundationUseCase;
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
    useCase = new UpdateFoundationUseCase(mockRepository);
  });

  it('should update foundation with provided fields', async () => {
    const input = {
      id: 'foundation-id-123',
      revision: 'Rev 2.0',
      excavation_volume: 150.0,
    };

    const updatedFoundation = new Foundation({
      id: 'foundation-id-123',
      project: 'Project A',
      revision: 'Rev 2.0',
      description: 'Main tower foundation',
      excavation_volume: 150.0,
      concrete_volume: 50.25,
      backfill_volume: 30.0,
      steel_volume: 5.5,
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedFoundation);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('foundation-id-123', {
      revision: 'Rev 2.0',
      excavation_volume: 150.0,
    });

    expect(result.revision).toBe('Rev 2.0');
    expect(result.excavation_volume).toBe(150.0);
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'foundation-id-123',
      description: 'Updated description',
    };

    const updatedFoundation = new Foundation({
      id: 'foundation-id-123',
      project: 'Project A',
      revision: 'Rev 1.0',
      description: 'Updated description',
      excavation_volume: 100.5,
      concrete_volume: 50.25,
      backfill_volume: 30.0,
      steel_volume: 5.5,
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedFoundation);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('foundation-id-123', {
      description: 'Updated description',
    });

    expect(result.description).toBe('Updated description');
  });
});
