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

    // Generate a data hash for updateTriggers
    const dataHash = visibleTowers.map(t => `${t.id}:${t.lat}:${t.lng}:${t.height}`).join(',');

    // Debug layer to visualize tower base positions at terrain level
    const debugLayer = new ScatterplotLayer({
      id: 'tower-debug-points',
      data: visibleTowers,
      // Position at terrain level with small z offset
      getPosition: (d: TowerMap) => [d.lng, d.lat, 5],
      getRadius: 15,
      getFillColor: [255, 0, 0, 200],
      pickable: true,
      updateTriggers: {
        getPosition: dataHash
      }
    });

    // ScenegraphLayer for 3D tower models
    // With interleaved: true, z is relative to terrain surface
    const towerLayer = new ScenegraphLayer({
      id: 'tower-3d-layer',
      data: visibleTowers,
      scenegraph: '/assets/models/towers/scene.gltf',
      // Position at terrain level (z = height/2 because model origin is at center)
      getPosition: (d: TowerMap) => [d.lng, d.lat, (d.height || 30) / 2],
      // Orientation: [yaw, pitch, roll] in degrees
      getOrientation: (d: TowerMap) => [d.deflection || 0, 0, 0],
      sizeScale: 1,
      getScale: (d: TowerMap) => {
        // Scale model to match tower height
        const h = d.height || 30;
        const scale = h / 1.82;
        return [scale, scale, scale];
      },
      _lighting: 'pbr',
      pickable: true,
      // Tell deck.gl exactly when data changes to avoid unnecessary reloads
      updateTriggers: {
        getPosition: dataHash,
        getOrientation: dataHash,
        getScale: dataHash
      },
      // Ensure layer doesn't auto-highlight on map movement
      autoHighlight: false,
      // Parameters for proper blending
      parameters: {
        depthTest: true,
        depthMask: true
      }
    });

    console.log('Tower layer created with', visibleTowers.length, 'towers, hash:', dataHash.substring(0, 50));

    return [towerLayer, debugLayer];
  }
}
