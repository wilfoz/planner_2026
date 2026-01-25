export interface Tower {
  id: string;
  code: number;
  tower_number: string;
  type: string;
  coordinates: Record<string, unknown>;
  distance?: number;
  height?: number;
  weight?: number;
  embargo?: string;
  foundations?: string[];
  deflection?: number;
  structureType?: 'suspension' | 'anchor' | 'terminal' | 'transposition';
  color?: string;
  isHidden?: boolean;
  work_id: string;
}

export interface CreateTowerDto {
  code: number;
  tower: string;
  type: string;
  coordinates: Record<string, unknown>;
  distance?: number;
  height?: number;
  weight?: number;
  embargo?: string;
  foundations?: string[];
  deflection?: number;
  structureType?: 'suspension' | 'anchor' | 'terminal' | 'transposition';
  color?: string;
  isHidden?: boolean;
  work_id: string;
}

export interface UpdateTowerDto extends Partial<Omit<CreateTowerDto, 'work_id'>> { }
