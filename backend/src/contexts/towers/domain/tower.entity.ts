import { Foundation } from '@/contexts/foundations/domain/foundation.entity';
import { Coordinates } from '@/contexts/towers/domain/coordinates.type';

export class Tower {
  constructor(
    readonly props: {
      id: string;
      code: number;
      tower_number: string;
      type: string;
      coordinates: Coordinates;
      distance?: number | null;
      height?: number | null;
      weight?: number | null;
      embargo?: string | null;
      deflection?: number | null;
      structureType?: string | null;
      color?: string | null;
      isHidden: boolean;
      work_id: string;
      createdAt: Date;
      foundations: Foundation[];
    },
  ) { }
}

