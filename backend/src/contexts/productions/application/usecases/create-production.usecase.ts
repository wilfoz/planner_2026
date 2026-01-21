import { ProductionOutput } from '@/contexts/productions/application/dto/production.output';
import { mapProductionToOutput } from '@/contexts/productions/application/usecases/production-mappers';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';

export class CreateProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) { }

  async execute(input: Omit<ProductionOutput, 'id' | 'created_at'>): Promise<ProductionOutput> {
    const created = await this.productions.create({
      status: input.status,
      comments: input.comments ?? null,
      start_time: input.start_time ?? null,
      final_time: input.final_time ?? null,
      task_id: input.task_id,
      work_id: input.work_id,
      teams: input.teams,
      towers: input.towers,
    });
    return mapProductionToOutput(created);
  }
}

