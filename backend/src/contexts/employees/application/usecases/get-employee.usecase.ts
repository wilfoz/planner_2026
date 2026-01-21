import { EmployeeOutput } from '@/contexts/employees/application/dto/employee.output';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetEmployeeUseCase {
  constructor(private readonly employees: EmployeesRepository) {}

  async execute(input: { id: string }): Promise<EmployeeOutput> {
    const employee = await this.employees.findById(input.id);
    if (!employee) throw new NotFoundError('Employee not found');

    return {
      id: employee.props.id,
      registration: employee.props.registration,
      full_name: employee.props.full_name,
      occupation: employee.props.occupation,
      leadership: employee.props.leadership,
      status: employee.props.status,
      team_id: employee.props.team_id ?? null,
      created_at: employee.props.createdAt,
    };
  }
}

