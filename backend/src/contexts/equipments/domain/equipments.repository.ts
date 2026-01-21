import { Equipment } from '@/contexts/equipments/domain/equipment.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type EquipmentsListResult = { total: number; items: Equipment[] };

export interface EquipmentsRepository {
  create(input: Omit<Equipment['props'], 'id' | 'createdAt'>): Promise<Equipment>;
  findById(id: string): Promise<Equipment | null>;
  list(input: PageInput): Promise<EquipmentsListResult>;
  update(id: string, input: Partial<Omit<Equipment['props'], 'id' | 'createdAt'>>): Promise<Equipment>;
  delete(id: string): Promise<void>;
}

export const EQUIPMENTS_REPOSITORY = Symbol('EQUIPMENTS_REPOSITORY');

