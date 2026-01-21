import { EquipmentOutput } from '@/contexts/equipments/application/dto/equipment.output';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';
import { buildPaginationMeta, normalizePageInput, PageInput } from '@/shared/pagination/pagination';
import { CollectionPresenter, PaginationMetaPresenter } from '@/shared/presenters/collection.presenter';

export class ListEquipmentsUseCase {
  constructor(private readonly equipments: EquipmentsRepository) {}

  async execute(input: Partial<PageInput>): Promise<CollectionPresenter<EquipmentOutput>> {
    const pageInput = normalizePageInput(input);
    const result = await this.equipments.list(pageInput);

    const meta = new PaginationMetaPresenter(
      buildPaginationMeta({ page: pageInput.page, per_page: pageInput.per_page, total: result.total }),
    );
    const data: EquipmentOutput[] = result.items.map((e) => ({
      id: e.props.id,
      registration: e.props.registration,
      model: e.props.model,
      manufacturer: e.props.manufacturer,
      license_plate: e.props.license_plate,
      provider: e.props.provider,
      status: e.props.status,
      team_id: e.props.team_id ?? null,
      created_at: e.props.createdAt,
    }));

    return new CollectionPresenter({ meta, data });
  }
}

