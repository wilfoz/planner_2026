import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Work, CreateWorkDto, UpdateWorkDto } from '../../../core/models/work.model';

@Injectable({
  providedIn: 'root'
})
export class WorkService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/works`;

  constructor() {
    console.log('WorkService environment:', environment);
    console.log('WorkService apiUrl:', this.apiUrl);
  }

  getAll(): Observable<Work[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(response => console.log('Raw API Response:', response)),
      map(response => response.data?.items || [])
    );
  }

  getById(id: string): Observable<Work> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`[WorkService] Requesting Work ID: ${id} at URL: ${url}`);

    return this.http.get<any>(url).pipe(
      tap({
        next: (response) => console.log(`[WorkService] Response for ${id}:`, response),
        error: (err) => console.error(`[WorkService] Error for ${id}:`, err)
      }),
      map(response => response.data || response)
    );
  }

  create(work: CreateWorkDto): Observable<Work> {
    return this.http.post<Work>(this.apiUrl, work);
  }

  update(id: string, work: UpdateWorkDto): Observable<Work> {
    return this.http.patch<Work>(`${this.apiUrl}/${id}`, work);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
