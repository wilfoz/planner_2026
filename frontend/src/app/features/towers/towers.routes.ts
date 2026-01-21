import { Routes } from '@angular/router';
import { TowersListComponent } from './towers-list/towers-list.component';
import { TowersFormComponent } from './towers-form/towers-form.component';
import { TowersDetailComponent } from './towers-detail/towers-detail.component';

export const towersRoutes: Routes = [
  { path: '', component: TowersListComponent },
  { path: 'new', component: TowersFormComponent },
  { path: ':id', component: TowersDetailComponent },
  { path: ':id/edit', component: TowersFormComponent }
];
