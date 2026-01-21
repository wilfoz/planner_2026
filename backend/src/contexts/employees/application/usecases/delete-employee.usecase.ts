import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';

export class DeleteEmployeeUseCase {
  constructor(private readonly employees: EmployeesRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.employees.delete(input.id);
  }
}

