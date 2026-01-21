import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { Tower, Span, CableSettings, MapConfig, UserPermissions } from '../models';

export interface MapDataResponse {
  success: boolean;
  data: {
    project: { id: string; name: string };
    mapConfig: MapConfig;
    towers: Tower[];
    spans: Span[];
    cableSettings: CableSettings;
    userPermissions: UserPermissions;
  };
}

@Injectable({ providedIn: 'root' })
export class MapDataService {
  private http = inject(HttpClient);

  private _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  getMapData(projectId: string): Observable<MapDataResponse> {
    this._loading$.next(true);
    return this.http.get<MapDataResponse>(`${environment.apiUrl}/projects/${projectId}/map`)
      .pipe(
        tap(() => this._loading$.next(false)),
        catchError(err => {
          this._loading$.next(false);
          return throwError(() => err);
        })
      );
  }

  updateTower(towerId: string, updates: Partial<Tower>): Observable<Tower> {
    return this.http.patch<Tower>(`${environment.apiUrl}/towers/${towerId}`, updates);
  }
}
