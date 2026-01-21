import { EquipmentsRepository } from '@/contexts/equipments/domain/equipments.repository';

export class DeleteEquipmentUseCase {
  constructor(private readonly equipments: EquipmentsRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.equipments.delete(input.id);
  }
}

