import { CreateProductionUseCase } from '@/contexts/productions/application/usecases/create-production.usecase';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';
import { ProductionEntity } from '@/contexts/productions/domain/production.entity';
import { STATUS_PRODUCTION } from '@prisma/client';

describe('CreateProductionUseCase', () => {
  let useCase: CreateProductionUseCase;
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
    useCase = new CreateProductionUseCase(mockRepository);
  });

  it('should create a production with all fields', async () => {
    const input = {
      status: STATUS_PRODUCTION.PROGRESS,
      comments: 'Production comment',
      start_time: mockDate,
      final_time: null,
      task_id: 'task-123',
      work_id: 'work-123',
      teams: ['team-1', 'team-2'],
      towers: ['tower-1'],
    };

    const createdProduction = new ProductionEntity({
      id: 'production-id-123',
      status: STATUS_PRODUCTION.PROGRESS,
      comments: 'Production comment',
      start_time: mockDate,
      final_time: null,
      task_id: 'task-123',
      work_id: 'work-123',
      teams: ['team-1', 'team-2'],
      towers: ['tower-1'],
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdProduction);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      status: STATUS_PRODUCTION.PROGRESS,
      comments: 'Production comment',
      start_time: mockDate,
      final_time: null,
      task_id: 'task-123',
      work_id: 'work-123',
      teams: ['team-1', 'team-2'],
      towers: ['tower-1'],
    });

    expect(result.id).toBe('production-id-123');
    expect(result.status).toBe(STATUS_PRODUCTION.PROGRESS);
    expect(result.teams).toEqual(['team-1', 'team-2']);
    expect(result.towers).toEqual(['tower-1']);
  });

  it('should create a production with minimal fields', async () => {
    const input = {
      status: STATUS_PRODUCTION.PROGRAMMED,
      comments: null,
      start_time: null,
      final_time: null,
      task_id: 'task-456',
      work_id: 'work-456',
      teams: [],
      towers: [],
    };

    const createdProduction = new ProductionEntity({
      id: 'production-id-456',
      status: STATUS_PRODUCTION.PROGRAMMED,
      comments: null,
      start_time: null,
      final_time: null,
      task_id: 'task-456',
      work_id: 'work-456',
      teams: [],
      towers: [],
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdProduction);

    const result = await useCase.execute(input);

    expect(result.comments).toBeNull();
    expect(result.start_time).toBeNull();
    expect(result.teams).toEqual([]);
    expect(result.towers).toEqual([]);
  });
});
