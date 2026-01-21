import { Routes } from '@angular/router';
import { TeamsListComponent } from './teams-list/teams-list.component';
import { TeamsFormComponent } from './teams-form/teams-form.component';
import { TeamsDetailComponent } from './teams-detail/teams-detail.component';

export const teamsRoutes: Routes = [
  { path: '', component: TeamsListComponent },
  { path: 'new', component: TeamsFormComponent },
  { path: ':id', component: TeamsDetailComponent },
  { path: ':id/edit', component: TeamsFormComponent }
];
