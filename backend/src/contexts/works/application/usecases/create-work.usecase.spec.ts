import { CreateWorkUseCase } from '@/contexts/works/application/usecases/create-work.usecase';
import { WorksRepository } from '@/contexts/works/domain/works.repository';
import { Work } from '@/contexts/works/domain/work.entity';

describe('CreateWorkUseCase', () => {
  let useCase: CreateWorkUseCase;
  let mockRepository: jest.Mocked<WorksRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateWorkUseCase(mockRepository);
  });

  it('should create a work with all fields', async () => {
    const input = {
      name: 'LT 500kV Project',
      tension: 500,
      extension: 150,
      start_date: mockDate.toISOString(),
      end_date: undefined,
    };

    const createdWork = new Work({
      id: 'work-id-123',
      name: 'LT 500kV Project',
      tension: 500,
      extension: 150,
      start_date: mockDate,
      end_date: null,
      createdAt: mockDate,
      states: [],
    });

    mockRepository.create.mockResolvedValue(createdWork);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      name: 'LT 500kV Project',
      tension: 500,
      extension: 150,
      start_date: mockDate,
      end_date: null,
    });

    expect(result.id).toBe('work-id-123');
    expect(result.name).toBe('LT 500kV Project');
    expect(result.tension).toBe(500);
  });

  it('should create a work with minimal fields', async () => {
    const input = {
      name: 'Simple Project',
      tension: undefined,
      extension: undefined,
      start_date: undefined,
      end_date: undefined,
    };

    const createdWork = new Work({
      id: 'work-id-456',
      name: 'Simple Project',
      tension: null,
      extension: null,
      start_date: null,
      end_date: null,
      createdAt: mockDate,
      states: [],
    });

    mockRepository.create.mockResolvedValue(createdWork);

    const result = await useCase.execute(input);

    expect(result.tension).toBeNull();
    expect(result.extension).toBeNull();
    expect(result.start_date).toBeNull();
  });
});
