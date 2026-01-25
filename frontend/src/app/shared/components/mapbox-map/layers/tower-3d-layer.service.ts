import { Injectable } from '@angular/core';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { TowerMap } from '../models';

export interface TowerLayerOptions {
  towerVerticalOffset: number;
  getTerrainElevation?: (lng: number, lat: number) => number;
}

@Injectable({ providedIn: 'root' })
export class Tower3DLayerService {
  getLayers(towers: TowerMap[], options: TowerLayerOptions): any[] {
    if (!options || towers.length === 0) return [];

    const visibleTowers = towers.filter(t => !t.isHidden);

    // Debug layer to visualize tower positions
    // Use altitude from tower data - this was working before
    const debugLayer = new ScatterplotLayer({
      id: 'tower-debug-points',
      data: visibleTowers,
      getPosition: (d: TowerMap) => [d.lng, d.lat, d.altitude],
      getRadius: 15,
      getFillColor: [255, 0, 0, 255],
      pickable: true
    });

    // ScenegraphLayer for 3D tower models
    const towerLayer = new ScenegraphLayer({
      id: 'tower-3d-layer',
      data: visibleTowers,
      scenegraph: '/assets/models/towers/scene.gltf',
      getPosition: (d: TowerMap) => [d.lng, d.lat, d.altitude],
      getOrientation: (d: TowerMap) => [0, d.deflection, 90],
      sizeScale: 1,
      getScale: (d: TowerMap) => {
        const height = d.height || 30;
        return [height, height, height];
      },
      pickable: true
    });

    console.log('Tower layer created with', visibleTowers.length, 'visible towers');
    console.log('First tower:', visibleTowers[0]?.name, 'altitude:', visibleTowers[0]?.altitude);

    return [towerLayer, debugLayer];
  }
}
