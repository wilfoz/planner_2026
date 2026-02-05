import { Directive, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, inject, NgZone, effect } from '@angular/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { TowerMap, Span, CableSettings } from '../models';
import { Tower3DLayerService } from '../layers/tower-3d-layer.service';
import { CableLayerService } from '../layers/cable-layer.service';
import { AnchorLayerService } from '../layers/anchor-layer.service';
import { TowerLabelLayerService } from '../layers/tower-label-layer.service';
import { CableConfigurationService } from '../services/cable-configuration.service';


/**
 * Directive to integrate Deck.gl overlay with Mapbox.
 * Based on React pattern from ORION reference project using ngOnChanges
 * to properly sync layers with Angular change detection.
 * Refactored to delegate tower layers to Tower3DLayerService.
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
  @Input() work: any = null; // Typing 'any' to avoid circular dependencies if simple import fails, or import Work model

  @Output() labelClick = new EventEmitter<{ tower: TowerMap, x: number, y: number }>();

  private overlay: MapboxOverlay | null = null;
  private ngZone = inject(NgZone);
  private tower3DService = inject(Tower3DLayerService);
  private cableLayerService = inject(CableLayerService);
  private anchorLayerService = inject(AnchorLayerService);
  private towerLabelService = inject(TowerLabelLayerService);
  private configService = inject(CableConfigurationService);
  private terrainRevision = 0;

  constructor() {
    effect(() => {
      // Track configuration changes
      this.configService.configurations();
      // Update layers when config changes
      if (this.overlay && this.mapInstance) {
        this.updateLayers();
      }
    });
  }

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
    if (!this.mapInstance) {
      console.warn('Map instance not available for Deck.gl overlay initialization.');
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.overlay = new MapboxOverlay({
        interleaved: true, // Ensures Deck.gl layers are correctly interleaved with Mapbox layers
        layers: []
      });
      this.mapInstance!.addControl(this.overlay);
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
      return;
    }

    const settings = this.cableSettings;

    // Use dedicated services to generate layers
    const commonOptions = {
      terrainRevision: this.terrainRevision,
      getTerrainElevation: (lng: number, lat: number) => this.mapInstance?.queryTerrainElevation([lng, lat]) ?? 0,
      towerVerticalOffset: settings.towerVerticalOffset || 0,
      settings: settings
    };

    const towerLayers = this.tower3DService.getLayers(this.towers, commonOptions);
    const cableLayers = this.cableLayerService.getLayers(this.towers, this.spans, settings, commonOptions, this.work);
    const anchorLayers = this.anchorLayerService.getLayers(this.towers, settings, commonOptions);

    // Tower Labels
    const labelLayers = this.towerLabelService.getLayers(this.towers, commonOptions, (info) => {
      if (info && info.object) {
        // Deck.gl click event info
        this.ngZone.run(() => {
          this.labelClick.emit({
            tower: info.object as TowerMap,
            x: info.x,
            y: info.y
          });
        });
      }
    });

    const layers = [...towerLayers, ...cableLayers, ...anchorLayers, ...labelLayers];

    // Update overlay with new layers
    this.overlay.setProps({ layers });
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
