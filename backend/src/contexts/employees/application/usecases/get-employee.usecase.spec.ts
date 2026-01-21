import { GetEmployeeUseCase } from '@/contexts/employees/application/usecases/get-employee.usecase';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';
import { Employee } from '@/contexts/employees/domain/employee.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { STATUS_EMPLOYEE } from '@prisma/client';

describe('GetEmployeeUseCase', () => {
  let useCase: GetEmployeeUseCase;
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
    useCase = new GetEmployeeUseCase(mockRepository);
  });

  it('should return employee when found', async () => {
    const employee = new Employee({
      id: 'employee-id-123',
      registration: 'EMP001',
      full_name: 'John Doe',
      occupation: 'Engineer',
      leadership: true,
      status: STATUS_EMPLOYEE.ACTIVE,
      team_id: 'team-123',
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(employee);

    const result = await useCase.execute({ id: 'employee-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('employee-id-123');
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

  it('should throw NotFoundError when employee not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Employee not found');
  });
});
