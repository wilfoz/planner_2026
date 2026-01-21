import { EquipmentOutput } from '@/contexts/equipments/application/dto/equipment.output';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';

export class CreateEquipmentUseCase {
  constructor(private readonly equipments: EquipmentsRepository) {}

  async execute(input: Omit<EquipmentOutput, 'id' | 'created_at'>): Promise<EquipmentOutput> {
    const created = await this.equipments.create({
      registration: input.registration,
      model: input.model,
      manufacturer: input.manufacturer,
      license_plate: input.license_plate,
      provider: input.provider,
      status: input.status,
      team_id: input.team_id ?? null,
    });

    return {
      id: created.props.id,
      registration: created.props.registration,
      model: created.props.model,
      manufacturer: created.props.manufacturer,
      license_plate: created.props.license_plate,
      provider: created.props.provider,
      status: created.props.status,
      team_id: created.props.team_id ?? null,
      created_at: created.props.createdAt,
    };
  }
}

