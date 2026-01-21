import { EmployeeOutput } from '@/contexts/employees/application/dto/employee.output';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';

export class CreateEmployeeUseCase {
  constructor(private readonly employees: EmployeesRepository) {}

  async execute(input: Omit<EmployeeOutput, 'id' | 'created_at'>): Promise<EmployeeOutput> {
    const created = await this.employees.create({
      registration: input.registration,
      full_name: input.full_name,
      occupation: input.occupation,
      leadership: input.leadership,
      status: input.status,
      team_id: input.team_id ?? null,
    });

    return {
      id: created.props.id,
      registration: created.props.registration,
      full_name: created.props.full_name,
      occupation: created.props.occupation,
      leadership: created.props.leadership,
      status: created.props.status,
      team_id: created.props.team_id ?? null,
      created_at: created.props.createdAt,
    };
  }
}

