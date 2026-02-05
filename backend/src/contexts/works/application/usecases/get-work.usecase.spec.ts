import { GetWorkUseCase } from '@/contexts/works/application/usecases/get-work.usecase';
import { WorksRepository } from '@/contexts/works/domain/works.repository';
import { Work } from '@/contexts/works/domain/work.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';

describe('GetWorkUseCase', () => {
  let useCase: GetWorkUseCase;
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
    useCase = new GetWorkUseCase(mockRepository);
  });

  it('should return work when found', async () => {
    const work = new Work({
      id: 'work-id-123',
      name: 'LT 500kV Project',
      tension: 500,
      extension: 150,
      start_date: mockDate,
      end_date: null,
      createdAt: mockDate,
      states: [],
    });

    mockRepository.findById.mockResolvedValue(work);

    const result = await useCase.execute('work-id-123');

    expect(mockRepository.findById).toHaveBeenCalledWith('work-id-123');
    expect(result.id).toBe('work-id-123');
    expect(result.name).toBe('LT 500kV Project');
  });

  it('should throw NotFoundError when work not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(NotFoundError);
    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Work not found');
  });
});
