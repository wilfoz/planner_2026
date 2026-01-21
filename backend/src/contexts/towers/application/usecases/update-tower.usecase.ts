import { TowerOutput } from '@/contexts/towers/application/dto/tower.output';
import { mapTowerToOutput } from '@/contexts/towers/application/usecases/tower-mappers';
import { Coordinates } from '@/contexts/towers/domain/coordinates.type';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';

export class UpdateTowerUseCase {
  constructor(private readonly towers: TowersRepository) { }

  async execute(input: {
    id: string;
    code?: number;
    tower?: string;
    type?: string;
    coordinates?: Coordinates;
    distance?: number | null;
    height?: number | null;
    weight?: number | null;
    embargo?: string | null;
    foundations?: string[];
  }): Promise<TowerOutput> {
    const updated = await this.towers.update(input.id, {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.tower !== undefined ? { tower_number: input.tower } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.coordinates !== undefined ? { coordinates: input.coordinates } : {}),
      ...(input.distance !== undefined ? { distance: input.distance } : {}),
      ...(input.height !== undefined ? { height: input.height } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.embargo !== undefined ? { embargo: input.embargo } : {}),
      ...(input.foundations !== undefined ? { foundations: input.foundations } : {}),
    });
    return mapTowerToOutput(updated);
  }
}

