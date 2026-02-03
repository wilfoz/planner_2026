import { Injectable, inject } from '@angular/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { TowerMap, CableSettings } from '../models';
import { CatenaryCalculatorService } from '../services/catenary-calculator.service';
import { TowerLayerOptions } from './tower-3d-layer.service';
import { TowerPhysicsService } from '../services/tower-physics.service';

@Injectable({ providedIn: 'root' })
export class AnchorLayerService {
  private readonly catenary = inject(CatenaryCalculatorService);
  private readonly physics = inject(TowerPhysicsService);

  getLayers(towers: TowerMap[], settings: CableSettings, options: TowerLayerOptions): any[] {
    const anchors = settings.anchors || [];
    const points: any[] = [];
    const { getTerrainElevation, towerVerticalOffset } = options;
    const getElev = getTerrainElevation || ((lng, lat) => 0);

    for (let i = 0; i < towers.length; i++) {
      const tower = towers[i];
      if (tower.isHidden) continue;

      const terrainAlt = getElev(tower.lng, tower.lat);
      const bearing = this.physics.calculateTowerBearing(i, towers);

      for (const anchor of anchors.filter(a => a.enabled)) {
        const pos = this.physics.calculateAnchorPosition(
          tower,
          bearing,
          anchor.h,
          1.0, // Top
          -(anchor.vOffset || 0), // Distance DOWN from top
          towerVerticalOffset,
          terrainAlt
        );

        points.push({
          position: [pos.lng, pos.lat, pos.alt],
          color: this.hexToRgb(anchor.color),
          radius: 0.5
        });
      }
    }

    return [
      new ScatterplotLayer({
        id: 'anchor-layer',
        data: points,
        getPosition: (d: any) => d.position,
        getFillColor: (d: any) => d.color,
        getRadius: (d: any) => d.radius,
        radiusUnits: 'meters',
        pickable: true,
        updateTriggers: {
          getPosition: [anchors.length, options.terrainRevision, options.towerVerticalOffset]
        }
      })
    ];
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
      [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] :
      [255, 0, 0];
  }
}
