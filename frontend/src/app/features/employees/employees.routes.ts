import { Routes } from '@angular/router';
import { EmployeesListComponent } from './employees-list/employees-list.component';
import { EmployeesFormComponent } from './employees-form/employees-form.component';
import { EmployeesDetailComponent } from './employees-detail/employees-detail.component';

export const employeesRoutes: Routes = [
  { path: '', component: EmployeesListComponent },
  { path: 'new', component: EmployeesFormComponent },
  { path: ':id', component: EmployeesDetailComponent },
  { path: ':id/edit', component: EmployeesFormComponent }
];
