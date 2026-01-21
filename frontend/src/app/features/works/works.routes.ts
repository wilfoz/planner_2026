import { Routes } from '@angular/router';
import { WorksListComponent } from './works-list/works-list.component';
import { WorksFormComponent } from './works-form/works-form.component';
import { WorksDetailComponent } from './works-detail/works-detail.component';

export const worksRoutes: Routes = [
  { path: '', component: WorksListComponent },
  { path: 'new', component: WorksFormComponent },
  { path: ':id', component: WorksDetailComponent },
  { path: ':id/edit', component: WorksFormComponent }
];
