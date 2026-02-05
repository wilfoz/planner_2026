import { TowerOutput } from '@/contexts/towers/application/dto/tower.output';
import { mapTowerToOutput } from '@/contexts/towers/application/usecases/tower-mappers';
import { Coordinates } from '@/contexts/towers/domain/coordinates.type';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';

export class UpdateTowerUseCase {
  constructor(private readonly towers: TowersRepository) { }

  async execute(input: {
    id: string;
    code?: number;
    tower_number?: string;
    type?: string;
    coordinates?: Coordinates;
    distance?: number | null;
    height?: number | null;
    weight?: number | null;
    embargo?: string | null;
    foundations?: string[];
    deflection?: number | null;
    structureType?: string | null;
    color?: string | null;
    isHidden?: boolean;
  }): Promise<TowerOutput> {
    const updated = await this.towers.update(input.id, {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.tower_number !== undefined ? { tower_number: input.tower_number } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.coordinates !== undefined ? { coordinates: input.coordinates } : {}),
      ...(input.distance !== undefined ? { distance: input.distance } : {}),
      ...(input.height !== undefined ? { height: input.height } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.embargo !== undefined ? { embargo: input.embargo } : {}),
      ...(input.foundations !== undefined ? { foundations: input.foundations } : {}),
      ...(input.deflection !== undefined ? { deflection: input.deflection } : {}),
      ...(input.structureType !== undefined ? { structureType: input.structureType } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.isHidden !== undefined ? { isHidden: input.isHidden } : {}),
    });
    return mapTowerToOutput(updated);
  }
}

