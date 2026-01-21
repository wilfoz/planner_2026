import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Work, CreateWorkDto, UpdateWorkDto } from '../../../core/models/work.model';

@Injectable({
  providedIn: 'root'
})
export class WorkService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/works`;

  getAll(): Observable<Work[]> {
    return this.http.get<Work[]>(this.apiUrl);
  }

  getById(id: string): Observable<Work> {
    return this.http.get<Work>(`${this.apiUrl}/${id}`);
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
