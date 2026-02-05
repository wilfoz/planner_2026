import { Injectable } from '@angular/core';
import { TextLayer } from '@deck.gl/layers';
import { TowerMap, TowerLayerOptions } from '../models';

@Injectable({ providedIn: 'root' })
export class TowerLabelLayerService {

  getLayers(towers: TowerMap[], options: TowerLayerOptions, onClick: (info: any) => void): any[] {
    if (!towers || towers.length === 0) return [];

    const visibleTowers = towers.filter(t => !t.isHidden);

    const layer = new TextLayer({
      id: 'tower-labels',
      data: visibleTowers,
      pickable: true,
      getPosition: (d: TowerMap) => {
        const terrainAlt = options.getTerrainElevation ? options.getTerrainElevation(d.lng, d.lat) : 0;
        // Position slightly above the tower
        const h = d.height || 30; // Use actual height or default
        const z = terrainAlt + options.towerVerticalOffset + h + 5; // 5 meters above top
        return [d.lng, d.lat, z];
      },
      getText: (d: TowerMap) => d.name,
      getSize: 16,
      getColor: [255, 255, 255, 255],
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      outlineWidth: 2,
      outlineColor: [0, 0, 0, 255],
      background: true,
      getBackgroundColor: [0, 0, 0, 150],
      backgroundPadding: [4, 2],
      billboard: true,
      fontFamily: 'Inter, Roboto, Arial',
      fontWeight: 'bold',
      onClick: (info: any) => onClick(info),
      updateTriggers: {
        getPosition: [options.terrainRevision, options.towerVerticalOffset],
        getText: [visibleTowers.length] // Simplistic, could be hash
      }
    });

    return [layer];
  }
}
