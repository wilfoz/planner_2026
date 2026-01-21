import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../../../core/models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employees`;

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
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
