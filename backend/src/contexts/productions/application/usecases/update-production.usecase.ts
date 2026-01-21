import { ProductionOutput } from '@/contexts/productions/application/dto/production.output';
import { mapProductionToOutput } from '@/contexts/productions/application/usecases/production-mappers';
import { ProductionsRepository } from '@/contexts/productions/domain/productions.repository';

export class UpdateProductionUseCase {
  constructor(private readonly productions: ProductionsRepository) {}

  async execute(input: Partial<Omit<ProductionOutput, 'created_at'>> & { id: string }): Promise<ProductionOutput> {
    const updated = await this.productions.update(input.id, {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.comments !== undefined ? { comments: input.comments } : {}),
      ...(input.start_time !== undefined ? { start_time: input.start_time } : {}),
      ...(input.final_time !== undefined ? { final_time: input.final_time } : {}),
      ...(input.task_id !== undefined ? { task_id: input.task_id } : {}),
      ...(input.teams !== undefined ? { teams: input.teams } : {}),
      ...(input.towers !== undefined ? { towers: input.towers } : {}),
    });
    return mapProductionToOutput(updated);
  }
}

