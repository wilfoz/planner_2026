import { ListEquipmentsUseCase } from '@/contexts/equipments/application/usecases/list-equipments.usecase';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';
import { Equipment } from '@/contexts/equipments/domain/equipment.entity';
import { STATUS_EQUIPMENT } from '@prisma/client';

describe('ListEquipmentsUseCase', () => {
  let useCase: ListEquipmentsUseCase;
  let mockRepository: jest.Mocked<EquipmentsRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListEquipmentsUseCase(mockRepository);
  });

  it('should return paginated equipments with meta', async () => {
    const equipments = [
      new Equipment({
        id: 'eq-1',
        registration: 'EQ001',
        model: 'Excavator X100',
        manufacturer: 'Caterpillar',
        license_plate: 'ABC-1234',
        provider: 'Heavy Equipment Inc',
        status: STATUS_EQUIPMENT.ACTIVE,
        team_id: 'team-1',
        createdAt: mockDate,
      }),
      new Equipment({
        id: 'eq-2',
        registration: 'EQ002',
        model: 'Crane C200',
        manufacturer: 'Liebherr',
        license_plate: 'XYZ-5678',
        provider: 'Crane Services Ltd',
        status: STATUS_EQUIPMENT.MAINTENANCE,
        team_id: null,
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: equipments });

    const result = await useCase.execute({ page: 1, per_page: 10 });

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.per_page).toBe(10);
    expect(result.meta.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]!.model).toBe('Excavator X100');
    expect(result.data[1]!.model).toBe('Crane C200');
  });

  it('should use default pagination values', async () => {
    mockRepository.list.mockResolvedValue({ total: 0, items: [] });

    await useCase.execute({});

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });
  });
});
