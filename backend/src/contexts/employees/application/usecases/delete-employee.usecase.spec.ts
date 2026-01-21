import { DeleteEmployeeUseCase } from '@/contexts/employees/application/usecases/delete-employee.usecase';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';

describe('DeleteEmployeeUseCase', () => {
  let useCase: DeleteEmployeeUseCase;
  let mockRepository: jest.Mocked<EmployeesRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteEmployeeUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'employee-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('employee-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'employee-id-123' })).rejects.toThrow('Database error');
  });
});
