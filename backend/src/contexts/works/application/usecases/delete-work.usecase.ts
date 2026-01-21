
import { WorksRepository } from '@/contexts/works/domain/works.repository';

export class DeleteWorkUseCase {
  constructor(private readonly works: WorksRepository) { }

  async execute(id: string): Promise<void> {
    await this.works.delete(id);
  }
}
