
import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { mapWorkToOutput } from '@/contexts/works/application/usecases/work-mappers';
import { WorksRepository } from '@/contexts/works/domain/works.repository';

export class UpdateWorkUseCase {
  constructor(private readonly works: WorksRepository) { }

  async execute(
    id: string,
    input: {
      name?: string;
      tension?: number;
      extension?: number;
      phases?: number;
      circuits?: number;
      lightning_rod?: number;
      start_date?: string;
      end_date?: string;
    },
  ): Promise<WorkOutput> {
    const updated = await this.works.update(id, {
      name: input.name,
      tension: input.tension,
      extension: input.extension,
      phases: input.phases,
      circuits: input.circuits,
      lightning_rod: input.lightning_rod,
      start_date: input.start_date ? new Date(input.start_date) : undefined,
      end_date: input.end_date ? new Date(input.end_date) : undefined,
    });

    return mapWorkToOutput(updated);
  }
}
