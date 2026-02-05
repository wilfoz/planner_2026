import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipment, CreateEquipmentDto, UpdateEquipmentDto } from '../../../core/models/equipment.model';
import { Collection } from '../../../core/models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/equipments`;

  getAll(params?: { page?: number; per_page?: number }): Observable<Collection<Equipment>> {
    return this.http.get<any>(this.apiUrl, { params: params as any }).pipe(
      map(response => ({
        data: response.data,
        meta: response.meta
      }))
    );
  }

  getById(id: string): Observable<Equipment> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  create(equipment: CreateEquipmentDto): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equipment);
  }

  update(id: string, equipment: UpdateEquipmentDto): Observable<Equipment> {
    return this.http.patch<Equipment>(`${this.apiUrl}/${id}`, equipment);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
