import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, forkJoin, map } from 'rxjs';
import { environment } from '@environments/environment';
import { TowerMap, Span, CableSettings, MapConfig, UserPermissions } from '../models';
import { WorkService } from '../../../../features/works/services/work.service';
import { TowerService } from '../../../../features/towers/services/tower.service';
import { MapMapperService } from './map-mapper.service';

export interface MapDataResponse {
  success: boolean;
  data: {
    project: { id: string; name: string };
    mapConfig: MapConfig;
    towers: TowerMap[];
    spans: Span[];
    cableSettings: CableSettings;
    userPermissions: UserPermissions;
  };
}

@Injectable({ providedIn: 'root' })
export class MapDataService {
  private http = inject(HttpClient);
  private workService = inject(WorkService);
  private towerService = inject(TowerService);
  private mapper = inject(MapMapperService);

  private _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  getMapData(projectId: string): Observable<MapDataResponse> {
    this._loading$.next(true);

    return forkJoin({
      work: this.workService.getById(projectId),
      towers: this.towerService.getByWorkId(projectId, { per_page: 1000 })
    }).pipe(
      map(({ work, towers }) => {
        const mappedTowers = this.mapper.mapTowers(towers.data);
        const mappedSpans = this.mapper.mapSpans(work, towers.data);

        return {
          success: true,
          data: {
            project: { id: work.id, name: work.name },
            mapConfig: {
              center: mappedTowers.length > 0 ? { lat: mappedTowers[0].lat, lng: mappedTowers[0].lng } : { lat: -23.5505, lng: -46.6333 },
              zoom: 12,
              bearing: 0,
              pitch: 60,
              bounds: undefined // Calculate bounds if needed
            },
            towers: mappedTowers,
            spans: mappedSpans,
            cableSettings: {
              tension: work.tension ?? 5000,
              temperature: 25,
              towerVerticalOffset: 0,
              globalOpacity: 1,
              anchors: this.generateDefaultAnchors(work.phases ?? 3)
            },
            userPermissions: { canUpdate: true, canDelete: true } // Mock permissions or fetch
          }
        };
      }),
      tap(() => this._loading$.next(false)),
      catchError(err => {
        this._loading$.next(false);
        return throwError(() => err);
      })
    );
  }

  updateTower(towerId: string, updates: Partial<TowerMap>): Observable<TowerMap> {
    // Note: This needs to map back to backend structure if we save.
    // However, the prompt focused on "casting typings" from backend -> frontend.
    // For now, we keep the patch call, but bear in mind the properties might differ.
    // Ideally we map `updates` back to `UpdateTowerDto`.
    return this.http.patch<TowerMap>(`${environment.apiUrl}/tower/${towerId}`, updates);
  }

  /**
   * Generates default cable anchor points for a given number of phases.
   * Standard transmission line configuration with conductor and ground wire positions.
   */
  private generateDefaultAnchors(phases: number): any[] {
    const anchors: any[] = [];
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

    // Ground wire at the top
    anchors.push({
      id: 'gw-1',
      label: 'Ground Wire',
      horizontalOffset: 0,
      verticalRatio: 0.95,
      color: '#6b7280',
      width: 2,
      enabled: true
    });

    // Phase conductors
    const phaseSpacing = 3; // meters horizontal offset
    for (let i = 0; i < phases; i++) {
      const offset = (i - (phases - 1) / 2) * phaseSpacing;
      anchors.push({
        id: `phase-${i + 1}`,
        label: `Phase ${i + 1}`,
        horizontalOffset: offset,
        verticalRatio: 0.7,
        color: colors[i % colors.length],
        width: 3,
        enabled: true
      });
    }

    return anchors;
  }
}
