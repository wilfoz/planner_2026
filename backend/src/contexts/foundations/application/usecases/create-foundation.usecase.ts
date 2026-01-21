import { FoundationOutput } from '@/contexts/foundations/application/dto/foundation.output';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';

export class CreateFoundationUseCase {
  constructor(private readonly foundations: FoundationsRepository) {}

  async execute(input: Omit<FoundationOutput, 'id' | 'created_at'>): Promise<FoundationOutput> {
    const created = await this.foundations.create({
      project: input.project,
      revision: input.revision,
      description: input.description,
      excavation_volume: input.excavation_volume ?? null,
      concrete_volume: input.concrete_volume ?? null,
      backfill_volume: input.backfill_volume ?? null,
      steel_volume: input.steel_volume ?? null,
    });

    return {
      id: created.props.id,
      project: created.props.project,
      revision: created.props.revision,
      description: created.props.description,
      excavation_volume: created.props.excavation_volume ?? null,
      concrete_volume: created.props.concrete_volume ?? null,
      backfill_volume: created.props.backfill_volume ?? null,
      steel_volume: created.props.steel_volume ?? null,
      created_at: created.props.createdAt,
    };
  }
}

