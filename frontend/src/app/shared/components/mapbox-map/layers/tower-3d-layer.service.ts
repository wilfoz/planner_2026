import { Injectable } from '@angular/core';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { GLTFLoader } from '@loaders.gl/gltf';
import { registerLoaders } from '@loaders.gl/core';
import { TowerMap } from '../models';

@Injectable({ providedIn: 'root' })
export class Tower3DLayerService {
  constructor() {
    registerLoaders([GLTFLoader]);
  }

  getLayers(towers: TowerMap[], cableSettings: { towerVerticalOffset: number }): any[] {
    if (!cableSettings || towers.length === 0) return [];

    // Debug layer to visualize tower positions independently of the model
    const debugLayer = new ScatterplotLayer({
      id: 'tower-debug-points',
      data: towers.filter(t => !t.isHidden),
      getPosition: (d: TowerMap) => [d.lng, d.lat, d.altitude + cableSettings.towerVerticalOffset],
      getRadius: 10,
      getFillColor: [255, 0, 0],
      pickable: true
    });

    const layer = new ScenegraphLayer({
      id: 'tower-3d-layer',
      data: towers.filter(t => !t.isHidden),
      scenegraph: '/assets/models/towers/scene.gltf',
      getPosition: (d: TowerMap) => [d.lng, d.lat, d.altitude + cableSettings.towerVerticalOffset],
      getOrientation: (d: TowerMap) => [0, (d.deflection + 90) % 360, 90],
      sizeScale: 50, // Temporarily increased scale for debugging
      pickable: true,
      onClick: (info: any) => {
        if (info.object) return true;
        return false;
      }
    });

    return [layer, debugLayer];
  }
}
