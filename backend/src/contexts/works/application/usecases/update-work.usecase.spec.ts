import { UpdateWorkUseCase } from '@/contexts/works/application/usecases/update-work.usecase';
import { WorksRepository } from '@/contexts/works/domain/works.repository';
import { Work } from '@/contexts/works/domain/work.entity';

describe('UpdateWorkUseCase', () => {
  let useCase: UpdateWorkUseCase;
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
    useCase = new UpdateWorkUseCase(mockRepository);
  });

  it('should update work with provided fields', async () => {
    const id = 'work-id-123';
    const input = {
      name: 'Updated Project Name',
      extension: '200km',
    };

    const updatedWork = new Work({
      id: 'work-id-123',
      name: 'Updated Project Name',
      tension: '500kV',
      extension: '200km',
      start_date: mockDate,
      end_date: null,
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedWork);

    const result = await useCase.execute(id, input);

    expect(mockRepository.update).toHaveBeenCalledWith('work-id-123', {
      name: 'Updated Project Name',
      extension: '200km',
    });

    expect(result.name).toBe('Updated Project Name');
    expect(result.extension).toBe('200km');
  });

  it('should only update fields that are provided', async () => {
    const id = 'work-id-123';
    const input = {
      end_date: mockDate.toISOString(),
    };

    const updatedWork = new Work({
      id: 'work-id-123',
      name: 'LT 500kV Project',
      tension: '500kV',
      extension: '150km',
      start_date: mockDate,
      end_date: mockDate,
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedWork);

    const result = await useCase.execute(id, input);

    expect(mockRepository.update).toHaveBeenCalledWith('work-id-123', {
      end_date: mockDate,
    });

    expect(result.end_date).toEqual(mockDate);
  });
});
