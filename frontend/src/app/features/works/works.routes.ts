import { Routes } from '@angular/router';

import { WorksFormComponent } from './works-form/works-form.component';
import { WorksDetailComponent } from './works-detail/works-detail.component';

export const worksRoutes: Routes = [
  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: 'new', component: WorksFormComponent },
  { path: ':id', component: WorksDetailComponent },
  { path: ':id/edit', component: WorksFormComponent }
];
