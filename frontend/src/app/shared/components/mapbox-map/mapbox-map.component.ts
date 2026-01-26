import {
  Component, Output, EventEmitter, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit, signal, inject, computed, input, NgZone
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import mapboxgl, { Map, NavigationControl, FullscreenControl } from 'mapbox-gl';
import { environment } from '@environments/environment';

import { MapDataService, MapDataResponse } from './services/map-data.service';
import { MapCacheService } from './services/map-cache.service';
import { DeckLayerDirective } from './directives/deck-layer.directive';
import { TowerMap, Span, CableSettings } from './models';

@Component({
  selector: 'app-mapbox-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DeckLayerDirective],
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
  private readonly destroy$ = new Subject<void>();

  // Expose map instance as signal for directive binding
  readonly mapInstance = signal<Map | null>(null);

  readonly towers = signal<TowerMap[]>([]);
  readonly spans = signal<Span[]>([]);
  readonly cableSettings = signal<CableSettings | null>(null);
  readonly canUpdate = signal(false);
  readonly isOffline = signal(!navigator.onLine);

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

  ngOnInit(): void {
    // Access token should be set globally or here
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
    // 1. Try cache first
    try {
      const cached = await this.cacheService.get(this.projectId());
      if (cached) {
        console.log('Loaded map data from cache');
        this.applyCachedData(cached);
      }
    } catch (err) {
      console.warn('Failed to load from cache', err);
    }

    // 2. If offline, stop here
    if (this.isOffline()) {
      return;
    }

    // 3. Fetch fresh data
    this.mapDataService.getMapData(this.projectId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (res: MapDataResponse) => {
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

    // Center map on towers when loading from cache
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
        // Center on towers if no bounds provided
        this.centerOnTowers(data.towers);
      } else {
        map.flyTo({ center: [data.mapConfig.center.lng, data.mapConfig.center.lat], zoom: data.mapConfig.zoom });
      }
    }
  }

  private centerOnTowers(towers: TowerMap[]): void {
    const map = this.mapInstance();
    if (!map || towers.length === 0) return;

    // Calculate bounds from tower coordinates
    const lngs = towers.map(t => t.lng);
    const lats = towers.map(t => t.lat);

    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];

    map.fitBounds(bounds, {
      padding: 100,
      duration: 2000,
      pitch: 60
    });
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
        // Set map instance AFTER terrain is ready - this triggers directive initialization
        this.ngZone.run(() => {
          this.mapInstance.set(map);
          this.mapReady.emit();

          // If we already have distinct towers loaded, center on them
          if (this.towers().length > 0) {
            this.centerOnTowers(this.towers());
          }
        });
      });

      map.on('move', () => this.updateViewState(map));
    });
  }

  private setupTerrain(map: Map): void {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 });
    map.setFog({ range: [0.5, 10], color: '#1a1c24', 'high-color': '#242b3b', 'space-color': '#000000' });
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
