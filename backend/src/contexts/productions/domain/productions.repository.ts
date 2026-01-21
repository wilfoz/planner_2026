import { ProductionEntity } from '@/contexts/productions/domain/production.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type ProductionsListResult = { total: number; items: ProductionEntity[] };

export interface ProductionsRepository {
  create(input: Omit<ProductionEntity['props'], 'id' | 'createdAt' | 'teams' | 'towers'> & { teams?: string[]; towers?: string[] }): Promise<ProductionEntity>;
  findById(id: string): Promise<ProductionEntity | null>;
  list(input: PageInput): Promise<ProductionsListResult>;
  update(
    id: string,
    input: Partial<Omit<ProductionEntity['props'], 'id' | 'createdAt' | 'teams' | 'towers'>> & { teams?: string[]; towers?: string[] },
  ): Promise<ProductionEntity>;
  delete(id: string): Promise<void>;

  addTeam(productionId: string, teamId: string): Promise<ProductionEntity>;
  delTeam(productionId: string, teamId: string): Promise<ProductionEntity>;
  addTower(productionId: string, towerId: string): Promise<ProductionEntity>;
  delTower(productionId: string, towerId: string): Promise<ProductionEntity>;
}

export const PRODUCTIONS_REPOSITORY = Symbol('PRODUCTIONS_REPOSITORY');

