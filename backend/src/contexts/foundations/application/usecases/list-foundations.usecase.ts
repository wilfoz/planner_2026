import { FoundationOutput } from '@/contexts/foundations/application/dto/foundation.output';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

export class ListFoundationsUseCase {
  constructor(private readonly foundations: FoundationsRepository) {}

  async execute(input: Partial<PageInput>): Promise<CollectionPresenter<FoundationOutput>> {
    const pageInput = normalizePageInput(input);
    const result = await this.foundations.list(pageInput);

    const meta = new PaginationMetaPresenter(
      buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }),
    );
    const data: FoundationOutput[] = result.items.map((f) => ({
      id: f.props.id,
      project: f.props.project,
      revision: f.props.revision,
      description: f.props.description,
      excavation_volume: f.props.excavation_volume ?? null,
      concrete_volume: f.props.concrete_volume ?? null,
      backfill_volume: f.props.backfill_volume ?? null,
      steel_volume: f.props.steel_volume ?? null,
      created_at: f.props.createdAt,
    }));

    return new CollectionPresenter({ meta, data });
  }
}

