import { GetProductionUseCase } from '@/contexts/productions/application/usecases/get-production.usecase';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';
import { ProductionEntity } from '@/contexts/productions/domain/production.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { STATUS_PRODUCTION } from '@prisma/client';

describe('GetProductionUseCase', () => {
  let useCase: GetProductionUseCase;
  let mockRepository: jest.Mocked<ProductionsRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addTeam: jest.fn(),
      delTeam: jest.fn(),
      addTower: jest.fn(),
      delTower: jest.fn(),
    };
    useCase = new GetProductionUseCase(mockRepository);
  });

  it('should return production when found', async () => {
    const production = new ProductionEntity({
      id: 'production-id-123',
      status: STATUS_PRODUCTION.PROGRESS,
      comments: 'Production comment',
      start_time: mockDate,
      final_time: null,
      task_id: 'task-123',
      work_id: 'work-123',
      teams: ['team-1'],
      towers: ['tower-1'],
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(production);

    const result = await useCase.execute({ id: 'production-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('production-id-123');
    expect(result.id).toBe('production-id-123');
    expect(result.status).toBe(STATUS_PRODUCTION.PROGRESS);
  });

  it('should throw NotFoundError when production not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Production not found');
  });
});
