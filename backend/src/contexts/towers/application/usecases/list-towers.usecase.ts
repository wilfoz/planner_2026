import { TowerOutput } from '@/contexts/towers/application/dto/tower.output';
import { mapTowerToOutput } from '@/contexts/towers/application/usecases/tower-mappers';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

import { ListTowersInput } from '@/contexts/towers/domain/towers.repository';

export class ListTowersUseCase {
  constructor(private readonly towers: TowersRepository) { }

  async execute(input: Partial<ListTowersInput>): Promise<CollectionPresenter<TowerOutput>> {
    const pageInput: ListTowersInput = {
      ...normalizePageInput(input),
      work_id: input.work_id,
    };
    const result = await this.towers.list(pageInput);

    const meta = new PaginationMetaPresenter(
      buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }),
    );
    const data = result.items.map(mapTowerToOutput);

    return new CollectionPresenter({ meta, data });
  }
}

