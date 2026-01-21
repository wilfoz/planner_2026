import { Foundation } from '@/contexts/foundations/domain/foundation.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type FoundationsListResult = { total: number; items: Foundation[] };

export interface FoundationsRepository {
  create(input: Omit<Foundation['props'], 'id' | 'createdAt'>): Promise<Foundation>;
  findById(id: string): Promise<Foundation | null>;
  list(input: PageInput): Promise<FoundationsListResult>;
  update(id: string, input: Partial<Omit<Foundation['props'], 'id' | 'createdAt'>>): Promise<Foundation>;
  delete(id: string): Promise<void>;
}

export const FOUNDATIONS_REPOSITORY = Symbol('FOUNDATIONS_REPOSITORY');

