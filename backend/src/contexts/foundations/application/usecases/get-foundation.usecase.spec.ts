import { GetFoundationUseCase } from '@/contexts/foundations/application/usecases/get-foundation.usecase';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';
import { Foundation } from '@/contexts/foundations/domain/foundation.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';

describe('GetFoundationUseCase', () => {
  let useCase: GetFoundationUseCase;
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
    useCase = new GetFoundationUseCase(mockRepository);
  });

  it('should return foundation when found', async () => {
    const foundation = new Foundation({
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

    mockRepository.findById.mockResolvedValue(foundation);

    const result = await useCase.execute({ id: 'foundation-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('foundation-id-123');
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

  it('should throw NotFoundError when foundation not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Foundation not found');
  });
});
