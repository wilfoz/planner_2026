import { TowerOutput } from '@/contexts/towers/application/dto/tower.output';
import { mapTowerToOutput } from '@/contexts/towers/application/usecases/tower-mappers';
import { TowersRepository } from '@/contexts/towers/domain/towers.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetTowerUseCase {
  constructor(private readonly towers: TowersRepository) {}

  async execute(input: { id: string }): Promise<TowerOutput> {
    const tower = await this.towers.findById(input.id);
    if (!tower) throw new NotFoundError('Tower not found');
    return mapTowerToOutput(tower);
  }
}

