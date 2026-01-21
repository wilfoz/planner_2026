import { TowersRepository } from '@/contexts/towers/domain/towers.repository';

export class DeleteTowerUseCase {
  constructor(private readonly towers: TowersRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.towers.delete(input.id);
  }
}

