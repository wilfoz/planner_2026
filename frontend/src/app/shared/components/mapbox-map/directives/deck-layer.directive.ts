import { Directive, Input, OnChanges, OnDestroy, SimpleChanges, inject, NgZone } from '@angular/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { GLTFLoader } from '@loaders.gl/gltf';
import { registerLoaders } from '@loaders.gl/core';
import mapboxgl from 'mapbox-gl';
import { TowerMap, Span, CableSettings } from '../models';
import { CatenaryCalculatorService, Point3D } from '../services/catenary-calculator.service';

// Register GLTFLoader globally
registerLoaders([GLTFLoader]);

/**
 * Directive to integrate Deck.gl overlay with Mapbox.
 * Uses ngOnChanges with proper change tracking.
 */
@Directive({
  selector: '[appDeckLayer]',
  standalone: true
})
export class DeckLayerDirective implements OnChanges, OnDestroy {
  @Input() mapInstance: mapboxgl.Map | null = null;
  @Input() towers: TowerMap[] = [];
  @Input() spans: Span[] = [];
  @Input() cableSettings: CableSettings | null = null;
  @Input() show3D = true;

  private overlay: MapboxOverlay | null = null;
  private ngZone = inject(NgZone);
  private towerBearings: Map<string, number> = new Map(); // Cache of tower ID to bearing angle
  private catenaryService = inject(CatenaryCalculatorService);

  // Track last data hash to avoid unnecessary updates
  private lastDataHash = '';
  private isMapStyleLoaded = false;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('DeckGL ngOnChanges:', {
      hasMapInstance: !!this.mapInstance,
      hasOverlay: !!this.overlay,
      isMapStyleLoaded: this.isMapStyleLoaded,
      towersCount: this.towers?.length || 0,
      changedKeys: Object.keys(changes)
    });

    // Initialize overlay when map becomes available
    if (changes['mapInstance'] && this.mapInstance && !this.overlay) {
      this.waitForMapAndInit();
    }

    // Update layers when relevant inputs change
    if (this.overlay && this.mapInstance && this.isMapStyleLoaded) {
      // Only update if data actually changed
      const currentHash = this.computeDataHash();
      if (currentHash !== this.lastDataHash) {
        this.lastDataHash = currentHash;
        this.updateLayers();
      }
    }
  }

  private waitForMapAndInit(): void {
    if (!this.mapInstance) return;

    console.log('DeckGL: Waiting for map, isStyleLoaded:', this.mapInstance.isStyleLoaded());

    // Wait for map to be fully idle (terrain loaded) before adding overlay
    const waitForIdle = () => {
      if (this.overlay) return;

      console.log('DeckGL: Waiting for idle...');
      this.mapInstance!.once('idle', () => {
        console.log('DeckGL: Map is idle, initializing overlay');
        this.initOverlay();
      });

      // Fallback timeout
      setTimeout(() => {
        if (!this.overlay) {
          console.log('DeckGL: Idle timeout, forcing init');
          this.initOverlay();
        }
      }, 3000);
    };

    if (this.mapInstance.isStyleLoaded()) {
      waitForIdle();
    } else {
      this.mapInstance.once('load', waitForIdle);
    }
  }

  private initOverlay(): void {
    if (!this.mapInstance || this.overlay) return;

    console.log('DeckGL: Initializing overlay with interleaved mode');

    // Use interleaved: true for terrain synchronization
    this.overlay = new MapboxOverlay({
      interleaved: true,
      layers: []
    });

    this.mapInstance.addControl(this.overlay as any);
    this.isMapStyleLoaded = true;



    // Force initial layer update
    this.ngZone.run(() => {
      this.lastDataHash = '';
      const currentHash = this.computeDataHash();

      if (currentHash) {
        this.lastDataHash = currentHash;
        this.updateLayers();
      }
    });
  }

  private computeDataHash(): string {
    if (!this.towers || this.towers.length === 0) return '';
    return `${this.show3D}-${this.towers.length}-${this.spans?.length || 0}-${this.towers.map(t => t.id).join(',')}`;
  }

  private updateLayers(): void {
    if (!this.overlay) {

      return;
    }

    // If 3D is disabled, clear layers
    if (!this.show3D) {
      this.overlay.setProps({ layers: [] });
      return;
    }

    // If no towers, clear layers
    if (!this.towers || this.towers.length === 0) {
      this.overlay.setProps({ layers: [] });
      return;
    }

    // Default cable settings
    const settings: CableSettings = this.cableSettings || {
      tension: 1200,
      towerVerticalOffset: 0,
      globalOpacity: 1,
      anchors: [{ id: 'default', horizontalOffset: 0, verticalRatio: 1.0, enabled: true, color: '#000000', width: 2, label: 'Default' }]
    };

    const visibleTowers = this.towers.filter(t => !t.isHidden);

    if (visibleTowers.length === 0) {
      this.overlay.setProps({ layers: [] });
      return;
    }



    // Calculate tower bearings from span data for proper orientation
    this.calculateTowerBearings(visibleTowers, this.spans || []);

    // Verify tower coordinates are valid
    const sampleTower = visibleTowers[0];


    const MODEL_URL = '/assets/models/towers/scene.gltf';

    /**
     * ScenegraphLayer for 3D tower models
     */
    const towerLayer = new ScenegraphLayer({
      id: 'towers-3d',
      data: visibleTowers,
      scenegraph: MODEL_URL,
      // Z = height/2 positions model center at half-height above terrain
      // With interleaved:true, this should work correctly
      getPosition: (d: TowerMap) => {
        const z = (d.height || 30) / 2;

        return [d.lng, d.lat, z];
      },
      // Orientation: [pitch, yaw, roll] in degrees
      // Roll 90 to stand upright, yaw to face perpendicular to cable
      getOrientation: (d: TowerMap) => {
        // Get calculated bearing from span data
        const bearing = this.towerBearings.get(d.id) || 0;
        // Negate bearing and add 90 to compensate for coordinate system differences
        // deck.gl yaw: positive = clockwise from north
        // Geographic bearing: 0=N, 90=E, 180=S, 270=W
        const yaw = -bearing + 90 + (d.deflection || 0);

        return [0, yaw, 90];
      },
      getScale: (d: TowerMap) => {
        const h = d.height || 30;
        const s = h / 1.82;
        return [s, s, s];
      },
      sizeScale: 1,
      _lighting: 'pbr',
      pickable: true,
      parameters: {
        depthTest: true,
        depthWrite: true
      },


    });

    // DEBUG: Simple ScatterplotLayer at z=0 to test interleaved mode
    // Using beforeId to insert into Mapbox layer stack before labels
    const debugLayer = new ScatterplotLayer({
      id: 'debug-towers',
      data: visibleTowers,
      getPosition: (d: TowerMap) => [d.lng, d.lat, 0], // z=0 should be on terrain
      getRadius: 15,
      getFillColor: [255, 0, 0, 255], // Bright red
      radiusUnits: 'meters',
      pickable: true,
      // @ts-ignore - beforeId is valid for deck.gl with interleaved mode
      beforeId: 'road-label' // Insert before road labels (above satellite, below labels)
    } as any);


    // Generate cable paths
    const cablePaths = this.generateCablePaths(visibleTowers, settings);


    const cableLayer = new PathLayer({
      id: 'cables-path',
      data: cablePaths,
      getPath: (d: { path: [number, number, number][] }) => d.path,
      getColor: [251, 191, 36, 255], // Amber
      getWidth: 4,
      widthUnits: 'pixels' as const,
      capRounded: true,
      jointRounded: true,
      parameters: {
        depthTest: true
      }
    });

    // Anchor points layer (for debugging visibility)
    const anchorPoints = visibleTowers.flatMap(t => {
      const anchors = settings.anchors?.filter(a => a.enabled) || [];
      return [
        // Tower base marker
        { position: [t.lng, t.lat, 0] as [number, number, number], color: [255, 0, 0] as [number, number, number] },
        // Anchor points
        ...anchors.map(anchor => ({
          position: [
            t.lng + this.catenaryService.metersToLng(anchor.horizontalOffset || 0, t.lat),
            t.lat,
            (t.height || 30) * (anchor.verticalRatio ?? 1.0) + (settings.towerVerticalOffset || 0)
          ] as [number, number, number],
          color: [0, 255, 0] as [number, number, number]
        }))
      ];
    });

    const anchorLayer = new ScatterplotLayer({
      id: 'anchors-scatter',
      data: anchorPoints,
      getPosition: (d: { position: [number, number, number] }) => d.position,
      getFillColor: (d: { color: [number, number, number] }) => d.color,
      getRadius: 3,
      radiusUnits: 'meters' as const,
      parameters: {
        depthTest: false
      }
    });

    // Apply all layers - including debug layer
    const layers = [debugLayer, towerLayer, cableLayer, anchorLayer];

    this.ngZone.runOutsideAngular(() => {
      this.overlay!.setProps({ layers });
    });

    console.log('DeckGL: Layers applied:', layers.map(l => l.id));
  }

  private generateCablePaths(towers: TowerMap[], settings: CableSettings): { path: [number, number, number][] }[] {
    if (!this.spans || this.spans.length === 0) {
      return this.generateSequentialPaths(towers, settings);
    }

    const paths: { path: [number, number, number][] }[] = [];
    const towerMap = new Map(towers.map(t => [t.id, t]));

    for (const span of this.spans) {
      const t1 = towerMap.get(span.towerStartId);
      const t2 = towerMap.get(span.towerEndId);
      if (!t1 || !t2) continue;

      const anchors = settings.anchors?.filter(a => a.enabled) || [
        { id: 'default', horizontalOffset: 0, verticalRatio: 1.0, enabled: true, color: '#000000', width: 2, label: 'Default' }
      ];

      for (const anchor of anchors) {
        const h1 = (t1.height || 30) * (anchor.verticalRatio ?? 1.0) + (settings.towerVerticalOffset || 0);
        const h2 = (t2.height || 30) * (anchor.verticalRatio ?? 1.0) + (settings.towerVerticalOffset || 0);
        const hOffset = anchor.horizontalOffset || 0;

        const start: Point3D = {
          x: t1.lng + this.catenaryService.metersToLng(hOffset, t1.lat),
          y: t1.lat,
          z: h1
        };

        const end: Point3D = {
          x: t2.lng + this.catenaryService.metersToLng(hOffset, t2.lat),
          y: t2.lat,
          z: h2
        };

        const tension = span.tension || settings.tension || 1200;
        const points = this.catenaryService.generateCatenaryPoints(start, end, tension, 40);
        paths.push({ path: points.map(p => [p.x, p.y, p.z] as [number, number, number]) });
      }
    }

    return paths;
  }

  private generateSequentialPaths(towers: TowerMap[], settings: CableSettings): { path: [number, number, number][] }[] {
    if (towers.length < 2) return [];

    const paths: { path: [number, number, number][] }[] = [];

    const sortedTowers = [...towers].sort((a, b) => {
      const extractNum = (name: string) => {
        const match = name.match(/(\d+)[\/\-](\d+)/);
        if (match) return parseFloat(`${match[1]}.${match[2]}`);
        const simple = name.match(/(\d+)/);
        return simple ? parseInt(simple[1]) : 0;
      };
      return extractNum(a.name) - extractNum(b.name);
    });

    for (let i = 0; i < sortedTowers.length - 1; i++) {
      const t1 = sortedTowers[i];
      const t2 = sortedTowers[i + 1];

      const z1 = t1.height || 30;
      const z2 = t2.height || 30;

      const start: Point3D = { x: t1.lng, y: t1.lat, z: z1 };
      const end: Point3D = { x: t2.lng, y: t2.lat, z: z2 };

      const tension = settings.tension || 1200;
      const points = this.catenaryService.generateCatenaryPoints(start, end, tension, 40);
      paths.push({ path: points.map(p => [p.x, p.y, p.z] as [number, number, number]) });
    }

    return paths;
  }

  /**
   * Calculate bearing (azimuth) from point 1 to point 2 in degrees.
   * Returns angle from 0-360 where 0 = North, 90 = East, etc.
   */
  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lng2 - lng1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360; // Normalize to 0-360
  }

  /**
   * Calculate bearings for all towers based on span connections.
   * The bearing is the average of incoming and outgoing cable directions.
   */
  private calculateTowerBearings(towers: TowerMap[], spans: Span[]): void {
    this.towerBearings.clear();

    const towerMap = new Map<string, TowerMap>();
    towers.forEach(t => towerMap.set(t.id, t));

    // For each tower, calculate bearing to next tower (forward direction)
    // Fall back to incoming direction for towers at end of line
    towers.forEach(tower => {
      let forwardBearing: number | null = null;
      let incomingBearing: number | null = null;

      spans.forEach(span => {
        if (span.towerStartId === tower.id) {
          const nextTower = towerMap.get(span.towerEndId);
          if (nextTower) {
            forwardBearing = this.calculateBearing(tower.lat, tower.lng, nextTower.lat, nextTower.lng);
          }
        } else if (span.towerEndId === tower.id) {
          const prevTower = towerMap.get(span.towerStartId);
          if (prevTower) {
            // Calculate incoming direction (from prev to this)
            incomingBearing = this.calculateBearing(prevTower.lat, prevTower.lng, tower.lat, tower.lng);
          }
        }
      });

      // Prioritize forward bearing, use incoming bearing for last towers
      const bearing = forwardBearing ?? incomingBearing ?? 0;
      this.towerBearings.set(tower.id, bearing);
    });
  }

  ngOnDestroy(): void {
    if (this.overlay && this.mapInstance) {
      try {
        this.mapInstance.removeControl(this.overlay as any);
      } catch (e) {
        console.warn('Error removing DeckGL overlay:', e);
      }
    }
    this.overlay = null;
  }
}
