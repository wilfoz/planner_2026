import { ProductionOutput } from '@/contexts/productions/application/dto/production.output';
import { mapProductionToOutput } from '@/contexts/productions/application/usecases/production-mappers';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: { id: string }): Promise<ProductionOutput> {
    const production = await this.productions.findById(input.id);
    if (!production) throw new NotFoundError('Production not found');
    return mapProductionToOutput(production);
  }
}

