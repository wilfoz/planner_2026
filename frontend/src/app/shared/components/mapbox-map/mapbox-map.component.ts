import {
  Component, Output, EventEmitter, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit, signal, inject, computed, input, NgZone
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import mapboxgl, { Map, NavigationControl, FullscreenControl } from 'mapbox-gl';
import { LucideAngularModule, Settings, Mountain, MountainSnow } from 'lucide-angular';
import { CableSettingsPanelComponent } from './components/cable-settings-panel/cable-settings-panel.component';
import { Work } from '../../../core/models/work.model';
import { environment } from '@environments/environment';

import { MapDataService, MapDataResponse } from './services/map-data.service';
import { MapCacheService } from './services/map-cache.service';
import { DeckLayerDirective } from './directives/deck-layer.directive';
import { TowerMap, Span, CableSettings } from './models';
import { TowerPhysicsService } from './services/tower-physics.service';

@Component({
  selector: 'app-mapbox-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DeckLayerDirective, LucideAngularModule, CableSettingsPanelComponent],
  templateUrl: './mapbox-map.component.html'
})
export class MapboxMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  readonly projectId = input.required<string>();
  readonly show3D = input(true);

  @Output() towerSelect = new EventEmitter<TowerMap | null>();
  @Output() mapReady = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();

  private readonly mapDataService = inject(MapDataService);
  private readonly cacheService = inject(MapCacheService);
  private readonly ngZone = inject(NgZone);
  private readonly physics = inject(TowerPhysicsService);
  private readonly destroy$ = new Subject<void>();

  // Expose map instance as signal for directive binding
  readonly mapInstance = signal<Map | null>(null);

  readonly towers = signal<TowerMap[]>([]);
  readonly spans = signal<Span[]>([]);
  readonly cableSettings = signal<CableSettings | null>(null);
  readonly canUpdate = signal(false);
  readonly isOffline = signal(!navigator.onLine);
  readonly terrainEnabled = signal(false);
  readonly showSettings = signal(false);
  readonly currentWork = signal<Work | null>(null);

  // Picking State
  readonly pickingCableIndex = signal<number | null>(null);
  readonly pickedCableResult = signal<{ index: number; h: number; v: number } | null>(null);


  readonly SettingsIcon = Settings;
  readonly MountainIcon = Mountain;
  readonly MountainSnowIcon = MountainSnow;

  readonly selectedTower = signal<TowerMap | null>(null);
  readonly viewState = signal({ zoom: 12, bearing: 0, pitch: 0, elevation: 0 });
  readonly isLoading = toSignal(this.mapDataService.loading$, { initialValue: false });

  readonly visibleTowers = computed(() => this.towers().filter(t => !t.isHidden));
  readonly totalSpans = computed(() => this.spans().length);

  // Getter for template binding
  get mapInstanceValue() { return this.mapInstance(); }
  get towersValue() { return this.towers(); }
  get spansValue() { return this.spans(); }
  get cableSettingsValue() { return this.cableSettings(); }
  get show3DValue() { return this.show3D(); }
  get terrainEnabledValue() { return this.terrainEnabled(); }

  ngOnInit(): void {
    (mapboxgl as any).accessToken = (environment as any).mapboxToken || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGlzZ...';

    window.addEventListener('online', () => this.isOffline.set(false));
    window.addEventListener('offline', () => this.isOffline.set(true));
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapInstance()?.remove();

    window.removeEventListener('online', () => this.isOffline.set(false));
    window.removeEventListener('offline', () => this.isOffline.set(true));
  }

  private async loadData(): Promise<void> {
    try {
      const cached = await this.cacheService.get(this.projectId());
      if (cached) {
        this.applyCachedData(cached);
      }
    } catch (err) {
      console.warn('Failed to load from cache', err);
    }

    if (this.isOffline()) return;

    const id = this.projectId();
    this.mapDataService.getMapData(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (res: MapDataResponse) => {
          this.currentWork.set(res.data.work);
          this.applyData(res);
          await this.cacheService.set(
            this.projectId(),
            res.data.towers,
            res.data.spans,
            res.data.cableSettings
          );
        },
        error: (err: any) => {
          this.error.emit(err.message || 'Failed to load map data');
        }
      });
  }

  private applyCachedData(cached: any): void {
    this.towers.set(cached.towers);
    this.spans.set(cached.spans);
    this.cableSettings.set(cached.cableSettings);
    this.centerOnTowers(cached.towers);
  }

  private applyData(res: MapDataResponse): void {
    const { data } = res;
    this.towers.set(data.towers);
    this.spans.set(data.spans);
    this.cableSettings.set(data.cableSettings);
    this.canUpdate.set(data.userPermissions.canUpdate);

    const map = this.mapInstance();
    if (map) {
      if (data.mapConfig.bounds) {
        map.fitBounds(data.mapConfig.bounds as [number, number, number, number], { padding: 100, duration: 2000 });
      } else if (data.towers.length > 0) {
        this.centerOnTowers(data.towers);
      } else {
        map.flyTo({ center: [data.mapConfig.center.lng, data.mapConfig.center.lat], zoom: data.mapConfig.zoom });
      }
    }
  }

  private centerOnTowers(towers: TowerMap[]): void {
    const map = this.mapInstance();
    if (!map || towers.length === 0) return;

    const lngs = towers.map(t => t.lng);
    const lats = towers.map(t => t.lat);

    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];

    map.fitBounds(bounds, { padding: 100, duration: 2000, pitch: 60 });
  }

  private initMap(): void {
    this.ngZone.runOutsideAngular(() => {
      const map = new Map({
        container: this.mapContainer.nativeElement,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-46.6333, -23.5505],
        zoom: 12,
        pitch: 60,
        bearing: 0,
        preserveDrawingBuffer: true,
        antialias: true
      });

      map.addControl(new NavigationControl(), 'bottom-right');
      map.addControl(new FullscreenControl(), 'bottom-right');

      map.on('load', () => {
        this.setupTerrain(map);
        this.ngZone.run(() => {
          this.mapInstance.set(map);
          this.mapReady.emit();
          if (this.towers().length > 0) {
            this.centerOnTowers(this.towers());
          }
        });
      });

      map.on('move', () => this.updateViewState(map));

      // New: Listen for clicks when picking
      map.on('click', (e) => {
        this.ngZone.run(() => this.handleMapClick(e));
      });
    });
  }

  // --- New features ---

  handleMapClick(e: mapboxgl.MapMouseEvent): void {
    const pickingIndex = this.pickingCableIndex();
    if (pickingIndex === null) return;

    const map = this.mapInstance();
    if (!map) return;

    const towers = this.towers();
    if (towers.length === 0) return;

    // Find nearest tower to click
    let nearest: TowerMap | null = null;
    let minDist = Infinity;
    const clickLng = e.lngLat.lng;
    const clickLat = e.lngLat.lat;

    for (const t of towers) {
      if (t.isHidden) continue;
      const d2 = (t.lng - clickLng) ** 2 + (t.lat - clickLat) ** 2;
      if (d2 < minDist) {
        minDist = d2;
        nearest = t;
      }
    }

    if (!nearest) return;

    // Calculate offsets
    const towerIdx = towers.findIndex(t => t.id === nearest!.id);
    const bearing = this.physics.calculateTowerBearing(towerIdx, towers);
    const terrainAlt = map.queryTerrainElevation(e.lngLat) ?? 0;

    const settings = this.cableSettings();
    const globalVOffset = settings?.towerVerticalOffset || 0;

    const result = this.physics.calculateLocalOffset(
      nearest,
      bearing,
      { lng: clickLng, lat: clickLat, alt: terrainAlt },
      terrainAlt,
      globalVOffset
    );

    // Set result
    this.pickedCableResult.set({
      index: pickingIndex,
      h: Number(result.h.toFixed(2)),
      v: Number(result.v.toFixed(2))
    });

    // Reset picking mode
    this.pickingCableIndex.set(null);
    map.getCanvas().style.cursor = '';
  }

  startPicking(index: number): void {
    this.pickingCableIndex.set(index);
    const map = this.mapInstance();
    if (map) {
      map.getCanvas().style.cursor = 'crosshair';
    }
  }

  cancelPicking(): void {
    this.pickingCableIndex.set(null);
    const map = this.mapInstance();
    if (map) {
      map.getCanvas().style.cursor = '';
    }
  }

  // --- End New features ---

  private setupTerrain(map: Map): void {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });
    map.setFog({ range: [0.5, 10], color: '#1a1c24', 'high-color': '#242b3b', 'space-color': '#000000' });
  }

  toggleTerrain(): void {
    const map = this.mapInstance();
    if (!map) return;

    const newState = !this.terrainEnabled();
    this.terrainEnabled.set(newState);

    if (newState) {
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    } else {
      map.setTerrain(null as any);
    }
    map.triggerRepaint();
  }

  toggleSettings(): void {
    this.showSettings.update(v => !v);
  }

  private updateViewState(map: Map): void {
    const center = map.getCenter();
    this.viewState.set({
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      elevation: map.queryTerrainElevation(center) ?? 0
    });
  }

  updateTower(towerId: string, updates: Partial<TowerMap>): void {
    if (!this.canUpdate()) return;
    this.towers.update((list: TowerMap[]) => list.map((t: TowerMap) => t.id === towerId ? { ...t, ...updates } : t));
    this.mapDataService.updateTower(towerId, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ error: (err: any) => this.error.emit(err.message) });
  }

  toggleVisibility(towerId: string, hide: boolean): void {
    this.updateTower(towerId, { isHidden: hide });
  }

  refresh(): void { this.loadData(); }

  flyTo(lat: number, lng: number, zoom = 16): void {
    const map = this.mapInstance();
    if (map) {
      map.flyTo({ center: [lng, lat], zoom, duration: 2000, pitch: 60 });
    }
  }
}
