import { Tower } from '@/contexts/towers/domain/tower.entity';
import { Coordinates } from '@/contexts/towers/domain/coordinates.type';
import { PageInput } from '@/shared/pagination/pagination';

export type TowersListResult = { total: number; items: Tower[] };

export interface TowersRepository {
  create(input: {
    code: number;
    tower_number: string;
    type: string;
    coordinates: Coordinates;
    distance?: number | null;
    height?: number | null;
    weight?: number | null;
    embargo?: string | null;
    work_id: string;
    foundations?: string[];
  }): Promise<Tower>;
  findById(id: string): Promise<Tower | null>;
  list(input: PageInput): Promise<TowersListResult>;
  update(
    id: string,
    input: Partial<{
      code: number;
      tower_number: string;
      type: string;
      coordinates: Coordinates;
      distance?: number | null;
      height?: number | null;
      weight?: number | null;
      embargo?: string | null;
      work_id?: string;
      foundations?: string[];
    }>,
  ): Promise<Tower>;
  delete(id: string): Promise<void>;
}

export const TOWERS_REPOSITORY = Symbol('TOWERS_REPOSITORY');

