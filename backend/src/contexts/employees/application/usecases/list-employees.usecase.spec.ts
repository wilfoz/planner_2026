import { ListEmployeesUseCase } from '@/contexts/employees/application/usecases/list-employees.usecase';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';
import { Employee } from '@/contexts/employees/domain/employee.entity';
import { STATUS_EMPLOYEE } from '@prisma/client';

describe('ListEmployeesUseCase', () => {
  let useCase: ListEmployeesUseCase;
  let mockRepository: jest.Mocked<EmployeesRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListEmployeesUseCase(mockRepository);
  });

  it('should return paginated employees with meta', async () => {
    const employees = [
      new Employee({
        id: 'emp-1',
        registration: 'EMP001',
        full_name: 'John Doe',
        occupation: 'Engineer',
        leadership: true,
        status: STATUS_EMPLOYEE.ACTIVE,
        team_id: 'team-1',
        createdAt: mockDate,
      }),
      new Employee({
        id: 'emp-2',
        registration: 'EMP002',
        full_name: 'Jane Smith',
        occupation: 'Technician',
        leadership: false,
        status: STATUS_EMPLOYEE.AWAY,
        team_id: null,
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: employees });

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
    expect(result.data[0]!.full_name).toBe('John Doe');
    expect(result.data[1]!.full_name).toBe('Jane Smith');
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
