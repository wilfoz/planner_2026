import { Injectable, inject } from '@angular/core';
import { PathLayer } from '@deck.gl/layers';
import { TowerMap, Span, CableSettings } from '../models';
import { CatenaryCalculatorService, Point3D } from '../services/catenary-calculator.service';

interface CableData {
  path: [number, number, number][];
  color: [number, number, number, number];
  width: number;
}

@Injectable({ providedIn: 'root' })
export class CableLayerService {
  private readonly catenary = inject(CatenaryCalculatorService);

  getLayers(towers: TowerMap[], spans: Span[], settings: CableSettings): any[] {
    const towerMap = new Map(towers.map(t => [t.id, t]));
    const cables: CableData[] = [];

    for (const span of spans) {
      const startTower = towerMap.get(span.towerStartId);
      const endTower = towerMap.get(span.towerEndId);
      if (!startTower || !endTower || startTower.isHidden || endTower.isHidden) continue;

      // Ensure anchors exist
      const anchors = settings.anchors || [];

      // Generate cables for each enabled anchor
      for (const anchor of anchors.filter(a => a.enabled)) {
        // With interleaved: true in MapboxOverlay, z is relative to terrain surface
        // Calculate z as height * verticalRatio (position on tower relative to ground)
        const startZ = startTower.height * anchor.verticalRatio + settings.towerVerticalOffset;
        const endZ = endTower.height * anchor.verticalRatio + settings.towerVerticalOffset;

        const start: Point3D = {
          x: startTower.lng + this.catenary.metersToLng(anchor.horizontalOffset, startTower.lat),
          y: startTower.lat,
          z: startZ
        };

        const end: Point3D = {
          x: endTower.lng + this.catenary.metersToLng(anchor.horizontalOffset, endTower.lat),
          y: endTower.lat,
          z: endZ
        };

        const points = this.catenary.generateCatenaryPoints(start, end, settings.tension, 30);
        const path = points.map(p => [p.x, p.y, p.z] as [number, number, number]);

        cables.push({
          path,
          color: this.hexToRgba(anchor.color, settings.globalOpacity),
          width: anchor.width
        });
      }
    }

    const layer = new PathLayer({
      id: 'cable-layer',
      data: cables,
      getPath: (d: CableData) => d.path,
      getColor: (d: CableData) => d.color,
      getWidth: (d: CableData) => d.width,
      widthUnits: 'pixels',
      jointRounded: true,
      capRounded: true,
      billboard: false
    });

    return [layer];
  }

  private hexToRgba(hex: string, opacity: number): [number, number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0, 255];

    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      Math.round(opacity * 255)
    ];
  }
}
