import { TeamOutput } from '@/contexts/teams/application/dto/team.output';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

export class ListTeamsUseCase {
  constructor(private readonly teams: TeamsRepository) {}

  async execute(input: Partial<PageInput>): Promise<CollectionPresenter<TeamOutput>> {
    const pageInput = normalizePageInput(input);
    const result = await this.teams.list(pageInput);

    const meta = new PaginationMetaPresenter(
      buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }),
    );
    const data: TeamOutput[] = result.items.map((t) => ({
      id: t.props.id,
      name: t.props.name,
      employees: t.props.employees,
      equipments: t.props.equipments,
      created_at: t.props.createdAt,
    }));

    return new CollectionPresenter({ meta, data });
  }
}

