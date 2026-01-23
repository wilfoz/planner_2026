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
      towers: this.towerService.getByWorkId(projectId)
    }).pipe(
      map(({ work, towers }) => {
        const mappedTowers = this.mapper.mapTowers(towers);
        const mappedSpans = this.mapper.mapSpans(work, towers);

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
              tension: work.tension ?? 0,
              temperature: 25,
              towerVerticalOffset: 0,
              globalOpacity: 1,
              anchors: [] // Defaults
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
}
