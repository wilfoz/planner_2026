import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Production, CreateProductionDto, UpdateProductionDto } from '../../../core/models/production.model';
import { Collection } from '../../../core/models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/production`;

  getAll(): Observable<Production[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string): Observable<Production> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  getByWorkId(workId: string, params?: { page?: number; per_page?: number }): Observable<Collection<Production>> {
    return this.http.get<any>(`${this.apiUrl}?work_id=${workId}`, { params: params as any }).pipe(
      map(response => ({
        data: response.data,
        meta: response.meta
      }))
    );
  }

  create(production: CreateProductionDto): Observable<Production> {
    return this.http.post<Production>(this.apiUrl, production);
  }

  update(id: string, production: UpdateProductionDto): Observable<Production> {
    return this.http.patch<Production>(`${this.apiUrl}/${id}`, production);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
