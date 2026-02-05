import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Foundation, CreateFoundationDto, UpdateFoundationDto } from '../../../core/models/foundation.model';
import { Collection } from '../../../core/models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class FoundationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/foundation`;

  getAll(params?: { page?: number; per_page?: number }): Observable<Collection<Foundation>> {
    return this.http.get<any>(this.apiUrl, { params: params as any }).pipe(
      map(response => ({
        data: response.data,
        meta: response.meta
      }))
    );
  }

  getById(id: string): Observable<Foundation> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  create(foundation: CreateFoundationDto): Observable<Foundation> {
    return this.http.post<Foundation>(this.apiUrl, foundation);
  }

  update(id: string, foundation: UpdateFoundationDto): Observable<Foundation> {
    return this.http.patch<Foundation>(`${this.apiUrl}/${id}`, foundation);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
