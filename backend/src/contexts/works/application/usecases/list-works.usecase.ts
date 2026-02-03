
import { WorkOutput } from '@/contexts/works/application/dto/work.output';
import { mapWorkToOutput } from '@/contexts/works/application/usecases/work-mappers';
import { WorksRepository } from '@/contexts/works/domain/works.repository';
import { normalizePageInput, PageInput } from '@/shared/pagination/pagination';

export type WorksListOutput = { total: number; items: WorkOutput[] };

export class ListWorksUseCase {
  constructor(private readonly works: WorksRepository) { }

  async execute(input: Partial<PageInput>, user?: any): Promise<WorksListOutput> {
    const pageInput = normalizePageInput(input);
    let filterIds: string[] | undefined;

    if (user) {
      const roles = user.realm_access?.roles || [];
      const isAdmin = roles.includes('ADMIN');

      if (!isAdmin) {
        // If not admin, restrict to assigned works
        // Handle array or single string from token
        const assigned = user.assigned_works;
        if (Array.isArray(assigned)) {
          filterIds = assigned;
        } else if (typeof assigned === 'string') {
          filterIds = [assigned];
        } else {
          filterIds = []; // No assignments found
        }
      }
    }

    const result = await this.works.list(pageInput, filterIds !== undefined ? { ids: filterIds } : undefined);

    return {
      total: result.total,
      items: result.items.map(mapWorkToOutput),
    };
  }
}
