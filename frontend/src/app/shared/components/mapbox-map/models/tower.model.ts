export interface TowerMap {
  id: string;
  name: string; // Re-added for compatibility
  code: number;
  tower_number: string;
  type: string; // Added type here
  lat: number;
  lng: number;
  altitude: number;
  height: number;
  deflection: number;
  structureType: 'suspension' | 'anchor' | 'terminal' | 'transposition';
  color?: string;
  isHidden: boolean;
}
