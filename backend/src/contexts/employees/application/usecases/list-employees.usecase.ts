import { EmployeeOutput } from '@/contexts/employees/application/dto/employee.output';
import { EmployeesRepository } from '@/contexts/employees/domain/employees.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

export class ListEmployeesUseCase {
  constructor(private readonly employees: EmployeesRepository) {}

  async execute(input: Partial<PageInput>): Promise<CollectionPresenter<EmployeeOutput>> {
    const pageInput = normalizePageInput(input);
    const result = await this.employees.list(pageInput);

    const meta = new PaginationMetaPresenter(
      buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }),
    );
    const data: EmployeeOutput[] = result.items.map((e) => ({
      id: e.props.id,
      registration: e.props.registration,
      full_name: e.props.full_name,
      occupation: e.props.occupation,
      leadership: e.props.leadership,
      status: e.props.status,
      team_id: e.props.team_id ?? null,
      created_at: e.props.createdAt,
    }));

    return new CollectionPresenter({ meta, data });
  }
}

