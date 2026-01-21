import { CreateEmployeeUseCase } from '@/contexts/employees/application/usecases/create-employee.usecase';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';
import { Employee } from '@/contexts/employees/domain/employee.entity';
import { STATUS_EMPLOYEE } from '@prisma/client';

describe('CreateEmployeeUseCase', () => {
  let useCase: CreateEmployeeUseCase;
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
    useCase = new CreateEmployeeUseCase(mockRepository);
  });

  it('should create an employee with all fields', async () => {
    const input = {
      registration: 'EMP001',
      full_name: 'John Doe',
      occupation: 'Engineer',
      leadership: true,
      status: STATUS_EMPLOYEE.ACTIVE,
      team_id: 'team-123',
    };

    const createdEmployee = new Employee({
      id: 'employee-id-123',
      registration: 'EMP001',
      full_name: 'John Doe',
      occupation: 'Engineer',
      leadership: true,
      status: STATUS_EMPLOYEE.ACTIVE,
      team_id: 'team-123',
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdEmployee);

    const result = await useCase.execute(input);

    expect(mockRepository.create).toHaveBeenCalledWith({
      registration: 'EMP001',
      full_name: 'John Doe',
      occupation: 'Engineer',
      leadership: true,
      status: STATUS_EMPLOYEE.ACTIVE,
      team_id: 'team-123',
    });

    expect(result).toEqual({
      id: 'employee-id-123',
      registration: 'EMP001',
      full_name: 'John Doe',
      occupation: 'Engineer',
      leadership: true,
      status: STATUS_EMPLOYEE.ACTIVE,
      team_id: 'team-123',
      created_at: mockDate,
    });
  });

  it('should create an employee without team_id', async () => {
    const input = {
      registration: 'EMP002',
      full_name: 'Jane Smith',
      occupation: 'Technician',
      leadership: false,
      status: STATUS_EMPLOYEE.AWAY,
      team_id: null,
    };

    const createdEmployee = new Employee({
      id: 'employee-id-456',
      registration: 'EMP002',
      full_name: 'Jane Smith',
      occupation: 'Technician',
      leadership: false,
      status: STATUS_EMPLOYEE.AWAY,
      team_id: null,
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdEmployee);

    const result = await useCase.execute(input);

    expect(result.team_id).toBeNull();
  });
});
