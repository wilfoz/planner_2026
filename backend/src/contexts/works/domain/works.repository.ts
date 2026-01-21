import { Work } from '@/contexts/works/domain/work.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type WorksListResult = { total: number; items: Work[] };

export interface WorksRepository {
  create(input: {
    name: string;
    tension?: string | null;
    extension?: string | null;
    start_date?: Date | null;
    end_date?: Date | null;
  }): Promise<Work>;
  findById(id: string): Promise<Work | null>;
  list(input: PageInput): Promise<WorksListResult>;
  update(
    id: string,
    input: Partial<{
      name: string;
      tension?: string | null;
      extension?: string | null;
      start_date?: Date | null;
      end_date?: Date | null;
    }>,
  ): Promise<Work>;
  delete(id: string): Promise<void>;
}

export const WORKS_REPOSITORY = Symbol('WORKS_REPOSITORY');
