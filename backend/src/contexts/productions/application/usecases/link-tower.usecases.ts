import { ProductionOutput } from '@/contexts/productions/application/dto/production.output';
import { mapProductionToOutput } from '@/contexts/productions/application/usecases/production-mappers';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';

export class AddTowerToProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: { productionId: string; towerId: string }): Promise<ProductionOutput> {
    const updated = await this.productions.addTower(input.productionId, input.towerId);
    return mapProductionToOutput(updated);
  }
}

export class DelTowerFromProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: { productionId: string; towerId: string }): Promise<ProductionOutput> {
    const updated = await this.productions.delTower(input.productionId, input.towerId);
    return mapProductionToOutput(updated);
  }
}

