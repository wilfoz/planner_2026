import { ProductionOutput } from '@/contexts/productions/application/dto/production.output';
import { mapProductionToOutput } from '@/contexts/productions/application/usecases/production-mappers';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

export class ListProductionsUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: Partial<PageInput>): Promise<CollectionPresenter<ProductionOutput>> {
    const pageInput = normalizePageInput(input);
    const result = await this.productions.list(pageInput);

    const meta = new PaginationMetaPresenter(
      buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }),
    );
    const data = result.items.map(mapProductionToOutput);

    return new CollectionPresenter({ meta, data });
  }
}

