import { EquipmentOutput } from '@/contexts/equipments/application/dto/equipment.output';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetEquipmentUseCase {
  constructor(private readonly equipments: EquipmentsRepository) {}

  async execute(input: { id: string }): Promise<EquipmentOutput> {
    const equipment = await this.equipments.findById(input.id);
    if (!equipment) throw new NotFoundError('Equipment not found');

    return {
      id: equipment.props.id,
      registration: equipment.props.registration,
      model: equipment.props.model,
      manufacturer: equipment.props.manufacturer,
      license_plate: equipment.props.license_plate,
      provider: equipment.props.provider,
      status: equipment.props.status,
      team_id: equipment.props.team_id ?? null,
      created_at: equipment.props.createdAt,
    };
  }
}

