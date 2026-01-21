
import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { mapWorkToOutput } from '@/contexts/works/application/usecases/work-mappers';
import { WorksRepository } from '@/contexts/works/domain/works.repository';
import { normalizePageInput, PageInput } from '@/shared/pagination/pagination';

export type WorksListOutput = { total: number; items: WorkOutput[] };

export class ListWorksUseCase {
  constructor(private readonly works: WorksRepository) { }

  async execute(input: Partial<PageInput>): Promise<WorksListOutput> {
    const pageInput = normalizePageInput(input);
    const result = await this.works.list(pageInput);

    return {
      total: result.total,
      items: result.items.map(mapWorkToOutput),
    };
  }
}
