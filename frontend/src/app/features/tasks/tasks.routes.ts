import { Routes } from '@angular/router';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { TasksFormComponent } from './tasks-form/tasks-form.component';
import { TasksDetailComponent } from './tasks-detail/tasks-detail.component';

export const tasksRoutes: Routes = [
  { path: '', component: TasksListComponent },
  { path: 'new', component: TasksFormComponent },
  { path: ':id', component: TasksDetailComponent },
  { path: ':id/edit', component: TasksFormComponent }
];
