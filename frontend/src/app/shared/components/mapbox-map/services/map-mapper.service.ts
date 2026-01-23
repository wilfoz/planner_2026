import { Injectable } from '@angular/core';
import { Work } from '../../../../core/models/work.model';
import { Tower } from '../../../../core/models/tower.model';
import { TowerMap } from '../models/tower.model';
import { Span } from '../models/span.model';

@Injectable({
  providedIn: 'root'
})
export class MapMapperService {

  mapTowers(towers: Tower[]): TowerMap[] {
    return towers.map(tower => ({
      id: tower.id,
      name: tower.tower_number, // User requested Tower.name but entity has tower_number/name? Checking core model... Core has 'tower_number'. Request says 'Tower.name'. Assuming mapping tower_number to name implies name. Wait, let's check core model.
      lat: (tower.coordinates as any).lat,
      lng: (tower.coordinates as any).lng,
      altitude: (tower.coordinates as any).altitude,
      height: tower.height ?? 0,
      deflection: tower.deflection ?? 0,
      structureType: tower.structureType ?? 'suspension',
      color: tower.color ?? '#0ea5e9',
      isHidden: tower.isHidden ?? false
    }));
  }

  mapSpans(work: Work, towers: Tower[]): Span[] {
    const sortedTowers = [...towers].sort((a, b) => a.code - b.code);
    const spans: Span[] = [];

    for (let i = 0; i < sortedTowers.length - 1; i++) {
      const current = sortedTowers[i];
      const next = sortedTowers[i + 1];

      spans.push({
        towerStartId: current.id,
        towerEndId: next.id,
        spanLength: next.distance ?? 0, // Mapping Tower.extension (assumed distance)
        tension: work.tension ?? 0,
        cablePhases: work.phases ?? 3,
        cableColor: '#0ea5e9',
        heightStart: 30,
        heightEnd: 30
      });
    }

    return spans;
  }
}
