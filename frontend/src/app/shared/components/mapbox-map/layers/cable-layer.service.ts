import { Injectable, inject } from '@angular/core';
import { PathLayer } from '@deck.gl/layers';
import { TowerMap, Span, CableSettings } from '../models';
import { CatenaryCalculatorService, Point3D } from '../services/catenary-calculator.service';
import { CableConfigurationService, CableDefinition } from '../services/cable-configuration.service';
import { TowerLayerOptions } from './tower-3d-layer.service';
import { TowerPhysicsService } from '../services/tower-physics.service';

interface CableData {
  path: [number, number, number][];
  color: [number, number, number, number];
  width: number;
}

@Injectable({ providedIn: 'root' })
export class CableLayerService {
  private readonly catenary = inject(CatenaryCalculatorService);
  private readonly configService = inject(CableConfigurationService);
  private readonly physics = inject(TowerPhysicsService);

  getLayers(towers: TowerMap[], spans: Span[], settings: CableSettings, options: TowerLayerOptions, work: any): any[] {
    const towerMap = new Map(towers.map(t => [t.id, t]));
    const towerIndices = new Map(towers.map((t, i) => [t.id, i]));
    const cables: CableData[] = [];

    // Pre-calculate defaults if work is available
    let defaults: CableDefinition[] = [];
    if (work) {
      defaults = this.generateDefaults(work);
    }

    const { getTerrainElevation, towerVerticalOffset } = options;
    const getElev = getTerrainElevation || ((lng, lat) => 0);

    for (const span of spans) {
      const startTower = towerMap.get(span.towerStartId);
      const endTower = towerMap.get(span.towerEndId);
      if (!startTower || !endTower || startTower.isHidden || endTower.isHidden) continue;

      let cableDefs = this.configService.getSettings(work?.id, startTower.type);
      if (!cableDefs || cableDefs.length === 0) {
        cableDefs = defaults;
      }

      const startIdx = towerIndices.get(startTower.id);
      const endIdx = towerIndices.get(endTower.id);

      // Calculate bearings
      const bearing1 = this.physics.calculateTowerBearing(startIdx !== undefined ? startIdx : 0, towers);
      const bearing2 = this.physics.calculateTowerBearing(endIdx !== undefined ? endIdx : 0, towers);

      if (cableDefs.length === 0) continue;

      for (const cableDef of cableDefs) {
        const terrainAlt1 = getElev(startTower.lng, startTower.lat);
        const terrainAlt2 = getElev(endTower.lng, endTower.lat);

        // vRatio = 1.0 (Top), vOffset = -cableDef.offsetY (Distance DOWN from top)

        const startPos = this.physics.calculateAnchorPosition(
          startTower,
          bearing1,
          cableDef.offsetX,
          1.0, // Top
          -cableDef.offsetY, // Negative offset from top
          towerVerticalOffset,
          terrainAlt1
        );

        const endPos = this.physics.calculateAnchorPosition(
          endTower,
          bearing2,
          cableDef.offsetX,
          1.0,
          -cableDef.offsetY,
          towerVerticalOffset,
          terrainAlt2
        );

        const start: Point3D = { x: startPos.lng, y: startPos.lat, z: startPos.alt };
        const end: Point3D = { x: endPos.lng, y: endPos.lat, z: endPos.alt };

        const points = this.catenary.generateCatenaryPoints(start, end, settings.tension || 5000, 80);

        // Ensure points follow terrain (simple clamp)
        const adjustedPoints = points.map(p => {
          const tElev = getElev(p.x, p.y);
          return [p.x, p.y, Math.max(p.z, tElev + 5)] as [number, number, number];
        });

        cables.push({
          path: adjustedPoints,
          color: this.hexToRgba(cableDef.color, settings.globalOpacity),
          width: cableDef.width || 3
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
      billboard: false,
      updateTriggers: {
        getPath: [settings.tension, settings.towerVerticalOffset, work?.id, options.terrainRevision]
      }
    });

    return [layer];
  }

  private generateDefaults(work: any): CableDefinition[] {
    const cables: CableDefinition[] = [];
    const phases = work.phases || 3;
    const circuits = work.circuits || 1;
    const lightningCount = work.lightning_rod || 0;
    const subConductorsPerPhase = work.number_of_conductor_cables || 1;

    // Phase colors: Red, Green, Blue
    const phaseColors = ['#FF0000', '#00FF00', '#0000FF'];

    // Sub-conductor spacing
    const subCableSpacing = 0.45;
    const subCableOffsets = this.generateSubCablePattern(subConductorsPerPhase, subCableSpacing);

    // Default reference distances from TOP
    const topPhaseDist = 4.5;
    const midPhaseDist = 9.0;
    const botPhaseDist = 13.5;

    // Double Circuit (Vertical)
    if (circuits === 2) {
      const horizontalOffset = 5.0;
      const phaseDists = [topPhaseDist, midPhaseDist, botPhaseDist];

      for (let circuit = 0; circuit < circuits; circuit++) {
        const sideMultiplier = circuit === 0 ? -1 : 1;

        for (let phase = 0; phase < phases; phase++) {
          const phaseColor = phaseColors[phase % phaseColors.length];
          const phaseDist = phaseDists[phase % 3];
          const phaseX = horizontalOffset * sideMultiplier;

          for (let subIdx = 0; subIdx < subCableOffsets.length; subIdx++) {
            const subOffset = subCableOffsets[subIdx];
            cables.push({
              id: `c${circuit}_p${phase}_s${subIdx}`,
              type: 'conductor',
              offsetX: phaseX + subOffset.x,
              offsetY: phaseDist + subOffset.y, // Positive distance from top
              color: phaseColor,
              width: 3
            });
          }
        }
      }
    }
    // Single Circuit (Horizontal)
    else {
      const phaseSpacing = 7.0;
      const refDist = 4.5; // Single level distance from top

      for (let phase = 0; phase < phases; phase++) {
        const phaseColor = phaseColors[phase % phaseColors.length];
        const phaseX = (phase - 1) * phaseSpacing;
        const phaseY = refDist;

        for (let subIdx = 0; subIdx < subCableOffsets.length; subIdx++) {
          const subOffset = subCableOffsets[subIdx];
          cables.push({
            id: `c0_p${phase}_s${subIdx}`,
            type: 'conductor',
            offsetX: phaseX + subOffset.x,
            offsetY: phaseY + subOffset.y,
            color: phaseColor,
            width: 3
          });
        }
      }
    }

    // Lightning rod cables (ground wires)
    for (let i = 0; i < lightningCount; i++) {
      let xOffset = 0;
      if (lightningCount > 1) {
        const spread = 4.0;
        xOffset = (i - 0.5) * spread * 2;
      }

      cables.push({
        id: `l${i}`,
        type: 'lightning',
        offsetX: xOffset,
        offsetY: 0, // At the very top
        color: '#FFFF00',
        width: 2
      });
    }

    return cables;
  }

  /**
   * Generates sub-cable offsets for bundled conductors.
   * Common configurations: 1, 2, 3, 4, or more sub-conductors per phase.
   */
  private generateSubCablePattern(count: number, spacing: number): { x: number; y: number }[] {
    if (count <= 1) return [{ x: 0, y: 0 }];

    // 2 cables: horizontal arrangement
    if (count === 2) {
      return [
        { x: -spacing / 2, y: 0 },
        { x: spacing / 2, y: 0 }
      ];
    }

    // 3 cables: triangular arrangement (2 up, 1 down as requested)
    // . .
    //  .
    if (count === 3) {
      return [
        { x: -spacing / 2, y: spacing / 2 }, // Top Left
        { x: spacing / 2, y: spacing / 2 },  // Top Right
        { x: 0, y: -spacing / 2 }            // Bottom Center
      ];
    }

    // 4 cables: square/quad arrangement
    // . .
    // . .
    if (count === 4) {
      const half = spacing / 2;
      return [
        { x: -half, y: half },  // Top Left
        { x: half, y: half },   // Top Right
        { x: -half, y: -half }, // Bottom Left
        { x: half, y: -half }   // Bottom Right
      ];
    }

    // Generic: distribute in a circle
    const radius = spacing * Math.max(1, count / 4);
    return Array.from({ length: count }, (_, i) => {
      const angle = (2 * Math.PI * i) / count;
      return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
    });
  }

  private hexToRgba(hex: string, opacity: number): [number, number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 255, 255]; // Default Blue fallback
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      Math.round(opacity * 255)
    ];
  }
}
