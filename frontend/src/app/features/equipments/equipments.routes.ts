import { Routes } from '@angular/router';
import { EquipmentsListComponent } from './equipments-list/equipments-list.component';
import { EquipmentsFormComponent } from './equipments-form/equipments-form.component';
import { EquipmentsDetailComponent } from './equipments-detail/equipments-detail.component';

export const equipmentsRoutes: Routes = [
  { path: '', component: EquipmentsListComponent },
  { path: 'new', component: EquipmentsFormComponent },
  { path: ':id', component: EquipmentsDetailComponent },
  { path: ':id/edit', component: EquipmentsFormComponent }
];
