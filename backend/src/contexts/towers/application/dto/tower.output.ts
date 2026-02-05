import { FoundationOutput } from '@/contexts/foundations/application/dto/foundation.output';
import { Coordinates } from '@/contexts/towers/domain/coordinates.type';

export type TowerOutput = {
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
  foundations: FoundationOutput[];
  created_at: Date;
};

