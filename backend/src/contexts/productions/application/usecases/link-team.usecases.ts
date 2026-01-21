import { ProductionOutput } from '@/contexts/productions/application/dto/production.output';
import { mapProductionToOutput } from '@/contexts/productions/application/usecases/production-mappers';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';

export class AddTeamToProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: { productionId: string; teamId: string }): Promise<ProductionOutput> {
    const updated = await this.productions.addTeam(input.productionId, input.teamId);
    return mapProductionToOutput(updated);
  }
}

export class DelTeamFromProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: { productionId: string; teamId: string }): Promise<ProductionOutput> {
    const updated = await this.productions.delTeam(input.productionId, input.teamId);
    return mapProductionToOutput(updated);
  }
}

