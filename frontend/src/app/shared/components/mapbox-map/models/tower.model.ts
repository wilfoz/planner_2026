export interface TowerMap {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude: number;
  height: number;
  deflection: number;
  structureType: 'suspension' | 'anchor' | 'terminal' | 'transposition';
  color?: string;
  isHidden: boolean;
}
