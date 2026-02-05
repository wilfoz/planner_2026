import { TowerOutput } from '@/contexts/towers/application/dto/tower.output';
import { mapTowerToOutput } from '@/contexts/towers/application/usecases/tower-mappers';
import { Coordinates } from '@/contexts/towers/domain/coordinates.type';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';

export class CreateTowerUseCase {
  constructor(private readonly towers: TowersRepository) { }

  async execute(input: {
    code: number;
    tower_number: string;
    type: string;
    coordinates: Coordinates;
    distance?: number;
    height?: number;
    weight?: number;
    embargo?: string;
    work_id: string;
    foundations?: string[];
    deflection?: number;
    structureType?: string;
    color?: string;
    isHidden?: boolean;
  }): Promise<TowerOutput> {
    const created = await this.towers.create({
      code: input.code,
      tower_number: input.tower_number,
      type: input.type,
      coordinates: input.coordinates,
      distance: input.distance ?? null,
      height: input.height ?? null,
      weight: input.weight ?? null,
      embargo: input.embargo ?? null,
      work_id: input.work_id,
      foundations: input.foundations,
      deflection: input.deflection ?? null,
      structureType: input.structureType ?? null,
      color: input.color ?? null,
      isHidden: input.isHidden ?? false,
    });

    return mapTowerToOutput(created);
  }
}

