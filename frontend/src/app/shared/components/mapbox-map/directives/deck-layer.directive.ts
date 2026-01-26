import { Directive, Input, OnChanges, OnDestroy, SimpleChanges, inject, NgZone } from '@angular/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import { TowerMap, Span, CableSettings } from '../models';
import { CatenaryCalculatorService, Point3D } from '../services/catenary-calculator.service';

/**
 * Directive to integrate Deck.gl overlay with Mapbox.
 * Based on React pattern from ORION reference project using ngOnChanges
 * to properly sync layers with Angular change detection.
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
  private catenaryService = inject(CatenaryCalculatorService);

  ngOnChanges(changes: SimpleChanges): void {
    // Initialize overlay when map becomes available
    if (changes['mapInstance'] && this.mapInstance && !this.overlay) {
      this.initOverlay();
    }

    // Update layers whenever any input changes
    if (this.overlay && this.mapInstance) {
      this.updateLayers();
    }
  }

  private initOverlay(): void {
    if (!this.mapInstance) return;

    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      this.overlay = new MapboxOverlay({
        interleaved: true, // Critical for terrain sync
        layers: []
      });
      this.mapInstance!.addControl(this.overlay as any);
      console.log('DeckGL overlay initialized');
    });
  }

  private updateLayers(): void {
    if (!this.overlay) return;

    // If 3D is disabled, clear layers
    if (!this.show3D) {
      this.overlay.setProps({ layers: [] });
      return;
    }

    // If no settings or no towers data at all, just wait
    if (!this.cableSettings || this.towers.length === 0) {
      console.log('DeckGL: Waiting for data...', { towers: this.towers.length, settings: !!this.cableSettings });
      return;
    }

    const visibleTowers = this.towers.filter(t => !t.isHidden);
    console.log('DeckGL: Visible towers:', visibleTowers.length, 'of', this.towers.length, 'total');

    const LOCAL_MODEL_URL = '/assets/models/towers/scene.gltf';

    // Generate cable paths using catenary math
    const cablePaths = this.generateCablePaths(visibleTowers);

    /**
     * ScenegraphLayer for 3D tower models
     * 
     * With interleaved: true, Deck.gl syncs with Mapbox terrain:
     * - Z coordinate is relative to terrain surface, NOT absolute altitude
     * - Only use tower height offset, terrain elevation is handled by Mapbox
     * 
     * Orientation in deck.gl: [yaw, pitch, roll] in degrees
     * - yaw: rotation around Z axis (heading)
     * - pitch: rotation around Y axis
     * - roll: rotation around X axis
     * 
     * GLTF model origin is at center, so offset by height/2
     */
    const towerLayer = new ScenegraphLayer({
      id: 'towers-layer',
      data: visibleTowers,
      scenegraph: LOCAL_MODEL_URL,
      // Position: [lng, lat, altitude] - Assumes GLTF model origin is at the base
      // Validated: removing height/2 fixes "floating", so origin is definitely at base.
      getPosition: (d: TowerMap) => [d.lng, d.lat, d.altitude || 0],
      // Orientation: [pitch, yaw, roll] (Deck.gl standard)
      // Trying Roll 90 (3rd axis) since Pitch 90 failed.
      // This rotates around the Y axis of the model/world intermediate.
      getOrientation: (d: TowerMap) => [0, (90 - (d.deflection || 0)) % 360, 90],
      getScale: (d: TowerMap) => {
        const h = d.height || 30;
        const s = h / 1.82; // Scale based on model's original height
        return [s, s, s];
      },
      sizeScale: 1,
      _lighting: 'pbr',
      pickable: true,
      parameters: {
        depthTest: true,
        depthWrite: true
      },
      updateTriggers: {
        getPosition: [visibleTowers.map(t => `${t.id}-${t.lat}-${t.lng}`).join(',')],
        getOrientation: [visibleTowers.map(t => `${t.id}-${t.deflection}`).join(',')]
      }
    });

    // Create Cable Layer - PathLayer
    const cableLayer = new PathLayer({
      id: 'cables-layer',
      data: cablePaths,
      getPath: (d: any) => d.path,
      getColor: [251, 191, 36, 255], // Amber color
      getWidth: 4,
      widthUnits: 'pixels' as const,
      capRounded: true,
      jointRounded: true,
      parameters: {
        depthTest: true
      },
      updateTriggers: {
        getPath: [cablePaths.length]
      }
    });

    // Generate anchor points implementation for visual debugging and alignment checking
    // This replicates the "red dots" seen in the user's reference image
    const anchorPoints: { position: [number, number, number], color: [number, number, number] }[] = [];
    const settings = this.cableSettings;

    if (settings && visibleTowers.length > 0) {
      const anchors = settings.anchors?.filter(a => a.enabled) || [
        { id: 'default', horizontalOffset: 0, verticalRatio: 1.0, enabled: true }
      ];

      visibleTowers.forEach(t => {
        anchors.forEach(anchor => {
          // Calculate absolute position of anchor point
          const h = (t.height || 30) * (anchor.verticalRatio ?? 1.0) + (settings.towerVerticalOffset || 0);
          const z = (t.altitude || 0) + h;

          // Calculate horizontal offset
          const hOffset = anchor.horizontalOffset || 0;
          // We need to apply rotation to the offset based on tower deflection!
          // Deflection is usually perpendicular to the line? Or heading?
          // For simplicity, let's just project it simple first or try to match cable logic
          // The cable logic uses `metersToLng` on plain lat/lng, implying offset is purely East/West?
          // Let's stick to the cable logic:
          const lngOffset = this.catenaryService.metersToLng(hOffset, t.lat);

          anchorPoints.push({
            position: [t.lng + lngOffset, t.lat, z],
            color: [255, 0, 0]
          });
        });
      });
    }

    const anchorLayer = new ScatterplotLayer({
      id: 'anchors-layer',
      data: anchorPoints,
      getPosition: (d: any) => d.position,
      getFillColor: (d: any) => d.color,
      getRadius: 1.5,
      radiusUnits: 'meters',
      parameters: {
        depthTest: false // Always visible on top for debugging
      }
    });

    const layers = [towerLayer, cableLayer, anchorLayer];
    console.log('DeckGL layers updated:', layers.length, 'layers,', visibleTowers.length, 'towers,', cablePaths.length, 'cables');

    // Update overlay with new layers
    this.overlay.setProps({ layers });
  }

  /**
   * Generate catenary cable paths between towers using spans data.
   * Uses CatenaryCalculatorService for accurate catenary curve calculation.
   * With interleaved: true, Z is relative to terrain surface.
   */
  private generateCablePaths(towers: TowerMap[]): { path: [number, number, number][] }[] {
    // If we have spans data, ALWAYS try to use it, regardless of visible tower count
    // Only fallback to sequential if spans is empty or undefined
    if (!this.spans || this.spans.length === 0) {
      console.log('DeckGL: No spans data, falling back to sequential connection');
      return this.generateSequentialPaths(towers);
    }

    const paths: { path: [number, number, number][] }[] = [];
    const settings = this.cableSettings!;
    // create map from ALL towers (not just visible ones) to ensure we can find connections
    // Wait, we only want to connect visible towers? Or connect if one end is visible?
    // Current logic: connect only if BOTH are visible.
    const towerMap = new Map(towers.map(t => [t.id, t]));

    // Use spans to define connections (not sequential tower ordering)
    for (const span of this.spans) {
      const t1 = towerMap.get(span.towerStartId);
      const t2 = towerMap.get(span.towerEndId);

      // If either tower is missing from the *visible* set (towers arg), skip
      if (!t1 || !t2) continue;

      // Get anchors from settings (or use defaults)
      const anchors = settings.anchors?.filter(a => a.enabled) || [
        { id: 'default', horizontalOffset: 0, verticalRatio: 1.0, enabled: true }
      ];

      for (const anchor of anchors) {
        // Z must include tower altitude (absolute elevation) + height on tower
        const h1 = (t1.height || 30) * (anchor.verticalRatio ?? 1.0) + (settings.towerVerticalOffset || 0);
        const h2 = (t2.height || 30) * (anchor.verticalRatio ?? 1.0) + (settings.towerVerticalOffset || 0);

        const z1 = (t1.altitude || 0) + h1;
        const z2 = (t2.altitude || 0) + h2;

        const hOffset = anchor.horizontalOffset || 0;

        const start: Point3D = {
          x: t1.lng + this.catenaryService.metersToLng(hOffset, t1.lat),
          y: t1.lat,
          z: z1
        };

        const end: Point3D = {
          x: t2.lng + this.catenaryService.metersToLng(hOffset, t2.lat),
          y: t2.lat,
          z: z2
        };

        // Use CatenaryCalculatorService for accurate catenary curve
        const tension = span.tension || settings.tension || 1200;
        const points = this.catenaryService.generateCatenaryPoints(start, end, tension, 40);
        const path = points.map(p => [p.x, p.y, p.z] as [number, number, number]);

        paths.push({ path });
      }
    }

    console.log('Generated', paths.length, 'cable paths from', this.spans.length, 'spans');
    return paths;
  }

  /**
   * Fallback: Generate sequential paths when no spans data available.
   * Connects towers in order sorted by name.
   */
  private generateSequentialPaths(towers: TowerMap[]): { path: [number, number, number][] }[] {
    if (towers.length < 2) return [];

    const paths: { path: [number, number, number][] }[] = [];
    const settings = this.cableSettings!;

    // Sort towers by name (format: "1/1", "2/1", "335/3", etc.)
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

      // With interleaved: true, Z must include absolute altitude
      // Connection point is at the TOP of the tower (altitude + height)
      const z1 = (t1.altitude || 0) + (t1.height || 30);
      const z2 = (t2.altitude || 0) + (t2.height || 30);

      const start: Point3D = { x: t1.lng, y: t1.lat, z: z1 };
      const end: Point3D = { x: t2.lng, y: t2.lat, z: z2 };

      const tension = settings.tension || 1200;
      const points = this.catenaryService.generateCatenaryPoints(start, end, tension, 40);
      const path = points.map(p => [p.x, p.y, p.z] as [number, number, number]);

      paths.push({ path });
    }

    console.log('Generated', paths.length, 'sequential cable paths from', sortedTowers.length, 'towers');
    return paths;
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
