import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tower, CreateTowerDto, UpdateTowerDto } from '../../../core/models/tower.model';
import { Collection } from '../../../core/models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class TowerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tower`;

  getAll(): Observable<Tower[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string): Observable<Tower> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  getByWorkId(workId: string, params?: { page?: number; per_page?: number }): Observable<Collection<Tower>> {
    return this.http.get<any>(`${this.apiUrl}?work_id=${workId}`, { params: params as any }).pipe(
      map(response => ({
        data: response.data,
        meta: response.meta
      }))
    );
  }

  create(tower: CreateTowerDto): Observable<Tower> {
    return this.http.post<Tower>(this.apiUrl, tower);
  }

  update(id: string, tower: UpdateTowerDto): Observable<Tower> {
    return this.http.patch<Tower>(`${this.apiUrl}/${id}`, tower);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
