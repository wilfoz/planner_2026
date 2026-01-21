import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipment, CreateEquipmentDto, UpdateEquipmentDto } from '../../../core/models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/equipments`;

  getAll(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.apiUrl);
  }

  getById(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
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
