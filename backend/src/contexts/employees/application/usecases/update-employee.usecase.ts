import { EmployeeOutput } from '@/contexts/employees/application/dto/employee.output';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';

export class UpdateEmployeeUseCase {
  constructor(private readonly employees: EmployeesRepository) {}

  async execute(
    input: Partial<Omit<EmployeeOutput, 'created_at'>> & { id: string },
  ): Promise<EmployeeOutput> {
    const updated = await this.employees.update(input.id, {
      ...(input.registration !== undefined ? { registration: input.registration } : {}),
      ...(input.full_name !== undefined ? { full_name: input.full_name } : {}),
      ...(input.occupation !== undefined ? { occupation: input.occupation } : {}),
      ...(input.leadership !== undefined ? { leadership: input.leadership } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.team_id !== undefined ? { team_id: input.team_id } : {}),
    });

    return {
      id: updated.props.id,
      registration: updated.props.registration,
      full_name: updated.props.full_name,
      occupation: updated.props.occupation,
      leadership: updated.props.leadership,
      status: updated.props.status,
      team_id: updated.props.team_id ?? null,
      created_at: updated.props.createdAt,
    };
  }
}

