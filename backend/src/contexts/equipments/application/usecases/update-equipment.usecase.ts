import { EquipmentOutput } from '@/contexts/equipments/application/dto/equipment.output';
import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';

export class UpdateEquipmentUseCase {
  constructor(private readonly equipments: EquipmentsRepository) {}

  async execute(
    input: Partial<Omit<EquipmentOutput, 'created_at'>> & { id: string },
  ): Promise<EquipmentOutput> {
    const updated = await this.equipments.update(input.id, {
      ...(input.registration !== undefined ? { registration: input.registration } : {}),
      ...(input.model !== undefined ? { model: input.model } : {}),
      ...(input.manufacturer !== undefined ? { manufacturer: input.manufacturer } : {}),
      ...(input.license_plate !== undefined ? { license_plate: input.license_plate } : {}),
      ...(input.provider !== undefined ? { provider: input.provider } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.team_id !== undefined ? { team_id: input.team_id } : {}),
    });

    return {
      id: updated.props.id,
      registration: updated.props.registration,
      model: updated.props.model,
      manufacturer: updated.props.manufacturer,
      license_plate: updated.props.license_plate,
      provider: updated.props.provider,
      status: updated.props.status,
      team_id: updated.props.team_id ?? null,
      created_at: updated.props.createdAt,
    };
  }
}

