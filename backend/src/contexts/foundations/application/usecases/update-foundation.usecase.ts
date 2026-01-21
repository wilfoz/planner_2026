import { FoundationOutput } from '@/contexts/foundations/application/dto/foundation.output';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';

export class UpdateFoundationUseCase {
  constructor(private readonly foundations: FoundationsRepository) {}

  async execute(input: Partial<Omit<FoundationOutput, 'created_at'>> & { id: string }): Promise<FoundationOutput> {
    const updated = await this.foundations.update(input.id, {
      ...(input.project !== undefined ? { project: input.project } : {}),
      ...(input.revision !== undefined ? { revision: input.revision } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.excavation_volume !== undefined ? { excavation_volume: input.excavation_volume } : {}),
      ...(input.concrete_volume !== undefined ? { concrete_volume: input.concrete_volume } : {}),
      ...(input.backfill_volume !== undefined ? { backfill_volume: input.backfill_volume } : {}),
      ...(input.steel_volume !== undefined ? { steel_volume: input.steel_volume } : {}),
    });

    return {
      id: updated.props.id,
      project: updated.props.project,
      revision: updated.props.revision,
      description: updated.props.description,
      excavation_volume: updated.props.excavation_volume ?? null,
      concrete_volume: updated.props.concrete_volume ?? null,
      backfill_volume: updated.props.backfill_volume ?? null,
      steel_volume: updated.props.steel_volume ?? null,
      created_at: updated.props.createdAt,
    };
  }
}

