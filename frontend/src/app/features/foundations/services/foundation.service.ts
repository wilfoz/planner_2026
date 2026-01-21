import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Foundation, CreateFoundationDto, UpdateFoundationDto } from '../../../core/models/foundation.model';

@Injectable({
  providedIn: 'root'
})
export class FoundationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/foundation`;

  getAll(): Observable<Foundation[]> {
    return this.http.get<Foundation[]>(this.apiUrl);
  }

  getById(id: string): Observable<Foundation> {
    return this.http.get<Foundation>(`${this.apiUrl}/${id}`);
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
