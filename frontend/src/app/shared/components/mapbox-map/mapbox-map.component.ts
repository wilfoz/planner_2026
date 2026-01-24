import {
  Component, Output, EventEmitter, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit, signal, inject, computed, effect, input
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import mapboxgl, { Map, NavigationControl, FullscreenControl } from 'mapbox-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { environment } from '@environments/environment';

import { MapDataService, MapDataResponse } from './services/map-data.service';
import { MapCacheService } from './services/map-cache.service';
import { Tower3DLayerService } from './layers/tower-3d-layer.service';
import { CableLayerService } from './layers/cable-layer.service';
import { AnchorLayerService } from './layers/anchor-layer.service';
import { TowerMap, Span, CableSettings } from './models';

@Component({
  selector: 'app-mapbox-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
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
  private readonly tower3DLayer = inject(Tower3DLayerService);
  private readonly cableLayer = inject(CableLayerService);
  private readonly anchorLayer = inject(AnchorLayerService);
  private readonly destroy$ = new Subject<void>();
  private map!: Map;
  private overlay: MapboxOverlay | null = null;

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

  constructor() {
    // Update 3D layers when towers/cables change
    effect(() => {
      if (!this.overlay) return;

      const towers = this.visibleTowers();
      const spans = this.spans();
      const settings = this.cableSettings();

      let layers: any[] = [];

      if (this.show3D() && settings) {
        const towerLayers = this.tower3DLayer.getLayers(towers, { towerVerticalOffset: settings.towerVerticalOffset });
        const cableLayers = this.cableLayer.getLayers(this.towers(), spans, settings);
        const anchorLayers = this.anchorLayer.getLayers(this.towers(), settings);
        layers = [...towerLayers, ...cableLayers, ...anchorLayers];
      }

      this.overlay.setProps({ layers });
    });
  }

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
    this.overlay?.finalize();
    this.map?.remove();

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
  }

  private applyData(res: MapDataResponse): void {
    const { data } = res;
    this.towers.set(data.towers);
    this.spans.set(data.spans);
    this.cableSettings.set(data.cableSettings);
    this.canUpdate.set(data.userPermissions.canUpdate);

    if (data.mapConfig.bounds) {
      this.map.fitBounds(data.mapConfig.bounds as [number, number, number, number], { padding: 100, duration: 2000 });
    } else {
      this.map.flyTo({ center: [data.mapConfig.center.lng, data.mapConfig.center.lat], zoom: data.mapConfig.zoom });
    }
  }

  private async initMap(): Promise<void> {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-46.6333, -23.5505],
      zoom: 12,
      pitch: 60,
      bearing: 0,
      preserveDrawingBuffer: true,
      antialias: true
    });

    this.map.addControl(new NavigationControl(), 'bottom-right');
    this.map.addControl(new FullscreenControl(), 'bottom-right');

    this.map.on('load', async () => {
      this.setupTerrain();

      this.overlay = new MapboxOverlay({
        interleaved: true,
        layers: []
      });
      this.map.addControl(this.overlay as any);

      // Force update layers now that overlay is ready
      const towers = this.visibleTowers();
      const settings = this.cableSettings();
      if (this.show3D() && settings) {
        const towerLayers = this.tower3DLayer.getLayers(towers, { towerVerticalOffset: settings.towerVerticalOffset });
        const cableLayers = this.cableLayer.getLayers(this.towers(), this.spans(), settings);
        const anchorLayers = this.anchorLayer.getLayers(this.towers(), settings);
        this.overlay.setProps({ layers: [...towerLayers, ...cableLayers, ...anchorLayers] });
      }

      this.mapReady.emit();
    });

    this.map.on('move', () => this.updateViewState());
  }

  private setupTerrain(): void {
    this.map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512 });
    this.map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 });
    this.map.setFog({ range: [0.5, 10], color: '#1a1c24', 'high-color': '#242b3b', 'space-color': '#000000' });
  }

  private updateViewState(): void {
    const center = this.map.getCenter();
    this.viewState.set({
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
      elevation: this.map.queryTerrainElevation(center) ?? 0
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
  flyTo(lat: number, lng: number, zoom = 16): void { this.map.flyTo({ center: [lng, lat], zoom, duration: 2000, pitch: 60 }); }
}
