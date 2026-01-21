import { Routes } from '@angular/router';
import { FoundationsListComponent } from './foundations-list/foundations-list.component';
import { FoundationsFormComponent } from './foundations-form/foundations-form.component';
import { FoundationsDetailComponent } from './foundations-detail/foundations-detail.component';

export const foundationsRoutes: Routes = [
  { path: '', component: FoundationsListComponent },
  { path: 'new', component: FoundationsFormComponent },
  { path: ':id', component: FoundationsDetailComponent },
  { path: ':id/edit', component: FoundationsFormComponent }
];
