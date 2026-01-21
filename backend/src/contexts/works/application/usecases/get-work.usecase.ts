
import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { mapWorkToOutput } from '@/contexts/works/application/usecases/work-mappers';
import { WorksRepository } from '@/contexts/works/domain/works.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetWorkUseCase {
  constructor(private readonly works: WorksRepository) { }

  async execute(id: string): Promise<WorkOutput> {
    const found = await this.works.findById(id);
    if (!found) throw new NotFoundError('Work not found');

    return mapWorkToOutput(found);
  }
}
