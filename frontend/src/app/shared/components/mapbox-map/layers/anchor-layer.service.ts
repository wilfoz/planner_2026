import { Injectable, inject } from '@angular/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { TowerMap, CableSettings } from '../models';
import { CatenaryCalculatorService } from '../services/catenary-calculator.service';

@Injectable({ providedIn: 'root' })
export class AnchorLayerService {
  private readonly catenary = inject(CatenaryCalculatorService);

  getLayers(towers: TowerMap[], settings: CableSettings): any[] {
    const anchors = settings.anchors || [];
    const points: any[] = [];

    for (const tower of towers) {
      if (tower.isHidden) continue;

      for (const anchor of anchors.filter(a => a.enabled)) {
        points.push({
          position: [
            tower.lng + this.catenary.metersToLng(anchor.horizontalOffset, tower.lat),
            tower.lat,
            tower.altitude + tower.height * anchor.verticalRatio + settings.towerVerticalOffset
          ],
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
        pickable: true
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
