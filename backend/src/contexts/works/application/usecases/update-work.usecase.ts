
import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { mapWorkToOutput } from '@/contexts/works/application/usecases/work-mappers';
import { WorksRepository } from '@/contexts/works/domain/works.repository';

export class UpdateWorkUseCase {
  constructor(private readonly works: WorksRepository) { }

  async execute(
    id: string,
    input: {
      name?: string;
      contractor?: string;
      tension?: number;
      extension?: number;
      phases?: number;
      circuits?: number;
      lightning_rod?: number;
      number_of_conductor_cables?: number;
      start_date?: string;
      end_date?: string;
      states?: string[];
    },
  ): Promise<WorkOutput> {
    const updated = await this.works.update(id, {
      name: input.name,
      contractor: input.contractor,
      tension: input.tension,
      extension: input.extension,
      phases: input.phases,
      circuits: input.circuits,
      lightning_rod: input.lightning_rod,
      number_of_conductor_cables: input.number_of_conductor_cables,
      start_date: input.start_date ? new Date(input.start_date) : undefined,
      end_date: input.end_date ? new Date(input.end_date) : undefined,
      states: input.states,
    });

    return mapWorkToOutput(updated);
  }
}
