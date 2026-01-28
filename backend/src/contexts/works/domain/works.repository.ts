import { Work } from '@/contexts/works/domain/work.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type WorksListResult = { total: number; items: Work[] };

export interface WorksRepository {
  create(input: {
    name: string;
    contractor?: string | null;
    tension?: number | null;
    extension?: number | null;
    phases?: number | null;
    circuits?: number | null;
    lightning_rod?: number | null;
    number_of_conductor_cables?: number | null;
    start_date?: Date | null;
    end_date?: Date | null;
    states?: string[];
  }): Promise<Work>;
  findById(id: string): Promise<Work | null>;
  list(input: PageInput): Promise<WorksListResult>;
  update(
    id: string,
    input: Partial<{
      name: string;
      contractor?: string | null;
      tension?: number | null;
      extension?: number | null;
      phases?: number | null;
      circuits?: number | null;
      lightning_rod?: number | null;
      number_of_conductor_cables?: number | null;
      start_date?: Date | null;
      end_date?: Date | null;
      states?: string[];
    }>,
  ): Promise<Work>;
  delete(id: string): Promise<void>;
}

export const WORKS_REPOSITORY = Symbol('WORKS_REPOSITORY');
