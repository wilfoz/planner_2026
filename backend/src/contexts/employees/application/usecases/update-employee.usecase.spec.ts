import { UpdateEmployeeUseCase } from '@/contexts/employees/application/usecases/update-employee.usecase';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';
import { Employee } from '@/contexts/employees/domain/employee.entity';
import { STATUS_EMPLOYEE } from '@prisma/client';

describe('UpdateEmployeeUseCase', () => {
  let useCase: UpdateEmployeeUseCase;
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
    useCase = new UpdateEmployeeUseCase(mockRepository);
  });

  it('should update employee with provided fields', async () => {
    const input = {
      id: 'employee-id-123',
      full_name: 'John Updated',
      occupation: 'Senior Engineer',
      status: STATUS_EMPLOYEE.AWAY,
    };

    const updatedEmployee = new Employee({
      id: 'employee-id-123',
      registration: 'EMP001',
      full_name: 'John Updated',
      occupation: 'Senior Engineer',
      leadership: true,
      status: STATUS_EMPLOYEE.AWAY,
      team_id: 'team-123',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedEmployee);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('employee-id-123', {
      full_name: 'John Updated',
      occupation: 'Senior Engineer',
      status: STATUS_EMPLOYEE.AWAY,
    });

    expect(result.full_name).toBe('John Updated');
    expect(result.occupation).toBe('Senior Engineer');
    expect(result.status).toBe(STATUS_EMPLOYEE.AWAY);
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'employee-id-123',
      leadership: false,
    };

    const updatedEmployee = new Employee({
      id: 'employee-id-123',
      registration: 'EMP001',
      full_name: 'John Doe',
      occupation: 'Engineer',
      leadership: false,
      status: STATUS_EMPLOYEE.ACTIVE,
      team_id: 'team-123',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedEmployee);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('employee-id-123', {
      leadership: false,
    });

    expect(result.leadership).toBe(false);
  });
});
