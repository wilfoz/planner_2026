import { CableSettings } from './cable-settings.model';

export interface TowerLayerOptions {
  towerVerticalOffset: number;
  terrainRevision?: number;
  getTerrainElevation?: (lng: number, lat: number) => number;
  settings?: CableSettings | null;
}
