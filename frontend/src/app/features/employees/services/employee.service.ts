import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../../../core/models/employee.model';
import { Collection } from '../../../core/models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employees`;

  getAll(params?: { page?: number; per_page?: number }): Observable<Collection<Employee>> {
    return this.http.get<any>(this.apiUrl, { params: params as any }).pipe(
      map(response => ({
        data: response.data,
        meta: response.meta
      }))
    );
  }

  getById(id: string): Observable<Employee> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  create(employee: CreateEmployeeDto): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  update(id: string, employee: UpdateEmployeeDto): Observable<Employee> {
    return this.http.patch<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
