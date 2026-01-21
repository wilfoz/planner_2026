import { FoundationOutput } from '@/contexts/foundations/application/dto/foundation.output';
import { FoundationsRepository } from '@/contexts/foundations/domain/foundations.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetFoundationUseCase {
  constructor(private readonly foundations: FoundationsRepository) {}

  async execute(input: { id: string }): Promise<FoundationOutput> {
    const foundation = await this.foundations.findById(input.id);
    if (!foundation) throw new NotFoundError('Foundation not found');

    return {
      id: foundation.props.id,
      project: foundation.props.project,
      revision: foundation.props.revision,
      description: foundation.props.description,
      excavation_volume: foundation.props.excavation_volume ?? null,
      concrete_volume: foundation.props.concrete_volume ?? null,
      backfill_volume: foundation.props.backfill_volume ?? null,
      steel_volume: foundation.props.steel_volume ?? null,
      created_at: foundation.props.createdAt,
    };
  }
}

