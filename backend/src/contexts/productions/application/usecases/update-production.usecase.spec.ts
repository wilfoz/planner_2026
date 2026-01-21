import { UpdateProductionUseCase } from '@/contexts/productions/application/usecases/update-production.usecase';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';
import { ProductionEntity } from '@/contexts/productions/domain/production.entity';
import { STATUS_PRODUCTION } from '@prisma/client';

describe('UpdateProductionUseCase', () => {
  let useCase: UpdateProductionUseCase;
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
    useCase = new UpdateProductionUseCase(mockRepository);
  });

  it('should update production with provided fields', async () => {
    const input = {
      id: 'production-id-123',
      status: STATUS_PRODUCTION.EXECUTED,
      final_time: mockDate,
    };

    const updatedProduction = new ProductionEntity({
      id: 'production-id-123',
      status: STATUS_PRODUCTION.EXECUTED,
      comments: 'Production comment',
      start_time: mockDate,
      final_time: mockDate,
      task_id: 'task-123',
      work_id: 'work-123',
      teams: ['team-1'],
      towers: ['tower-1'],
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedProduction);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('production-id-123', {
      status: STATUS_PRODUCTION.EXECUTED,
      final_time: mockDate,
    });

    expect(result.status).toBe(STATUS_PRODUCTION.EXECUTED);
    expect(result.final_time).toEqual(mockDate);
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'production-id-123',
      comments: 'Updated comment',
    };

    const updatedProduction = new ProductionEntity({
      id: 'production-id-123',
      status: STATUS_PRODUCTION.PROGRESS,
      comments: 'Updated comment',
      start_time: mockDate,
      final_time: null,
      task_id: 'task-123',
      work_id: 'work-123',
      teams: ['team-1'],
      towers: ['tower-1'],
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedProduction);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('production-id-123', {
      comments: 'Updated comment',
    });

    expect(result.comments).toBe('Updated comment');
  });
});
