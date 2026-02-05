import { Injectable, inject } from '@angular/core';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { CableSettings, TowerMap, TowerLayerOptions } from '../models';
import { TowerPhysicsService } from '../services/tower-physics.service';

const DEFAULT_MODEL_URL = '/assets/models/towers/scene.gltf';

@Injectable({ providedIn: 'root' })
export class Tower3DLayerService {
  private physics = inject(TowerPhysicsService);

  getLayers(towers: TowerMap[], options: TowerLayerOptions): any[] {
    if (!options || towers.length === 0) return [];

    const visibleTowers = towers.filter(t => !t.isHidden);

    // Generate a data hash for updateTriggers
    const dataHash = visibleTowers.map(t => `${t.id}:${t.lat}:${t.lng}:${0}`).join(',');

    // Debug layer to visualize tower base positions at terrain level
    const debugLayer = new ScatterplotLayer({
      id: 'tower-debug-points',
      data: visibleTowers,
      // Position at terrain level to verify clamping
      getPosition: (d: TowerMap) => {
        const terrainAlt = options.getTerrainElevation ? options.getTerrainElevation(d.lng, d.lat) : 0;
        return [d.lng, d.lat, terrainAlt + options.towerVerticalOffset];
      },
      getRadius: 5,
      getFillColor: [255, 0, 0, 255],
      pickable: true,
      updateTriggers: {
        getPosition: [dataHash, options.terrainRevision, options.towerVerticalOffset]
      }
    });

    const settings = options.settings;
    const modelConfigs = settings?.modelConfigs || {};
    const customModelUrl = settings?.customModelUrl;
    const modelUrl = customModelUrl || DEFAULT_MODEL_URL;

    // ScenegraphLayer for 3D tower models
    const towerLayer = new ScenegraphLayer({
      id: 'tower-3d-layer',
      data: visibleTowers,
      scenegraph: modelUrl,
      // Position at terrain level (z = terrain + scaled base offset)
      getPosition: (d: TowerMap) => {
        const config = modelConfigs[modelUrl];
        const terrainAlt = options.getTerrainElevation ? options.getTerrainElevation(d.lng, d.lat) : 0;
        const h = d.height || 30;
        const intrinsicHeight = config?.intrinsicHeight || 1.822;
        const yOffsetToBase = config?.offset?.[2] !== undefined ? config.offset[2] : 1.0;
        const scale = h / intrinsicHeight;
        const zDisplacement = scale * yOffsetToBase;

        return [d.lng, d.lat, terrainAlt + zDisplacement + options.towerVerticalOffset];
      },
      // Orientation: [pitch, yaw, roll] in degrees
      getOrientation: ((d: TowerMap, { index, data }: { index: number, data: TowerMap[] }): [number, number, number] => {
        const config = modelConfigs[modelUrl];
        const pitch = config?.rotation?.[0] || 0;
        const roll = config?.rotation?.[2] || 90; // Default 90 roll for typical tower models
        const yawBase = config?.rotation?.[1] || 0;

        // Use centralized physics service for bearing
        const angle = this.physics.calculateTowerBearing(index, data);

        // Convert bearing (CW from North) to Deck.gl yaw (CCW from North?)
        // Added 90 degree offset to align cross-arms correctly with the line
        const yaw = (yawBase - angle - (d.deflection || 0) + 90) % 360;

        return [pitch, yaw, roll];
      }) as any,
      sizeScale: 1,
      getScale: ((d: TowerMap): [number, number, number] => {
        const config = modelConfigs[modelUrl];
        const h = d.height || 30;
        const intrinsicHeight = config?.intrinsicHeight || 1.822;
        const scale = h / intrinsicHeight;
        const [sx, sy, sz] = config?.scale || [1, 1, 1];
        return [scale * sx, scale * sy, scale * sz];
      }) as any,
      _lighting: 'pbr',
      pickable: true,
      updateTriggers: {
        getPosition: [dataHash, options.towerVerticalOffset, options.terrainRevision, customModelUrl],
        getOrientation: [dataHash, customModelUrl],
        getScale: [dataHash, customModelUrl]
      },
      autoHighlight: false,
      parameters: {
        depthTest: true,
        depthMask: true
      }
    });


    return [towerLayer, debugLayer];
  }
}
