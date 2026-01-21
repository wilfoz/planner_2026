import { Routes } from '@angular/router';
import { ProductionsListComponent } from './productions-list/productions-list.component';
import { ProductionsFormComponent } from './productions-form/productions-form.component';
import { ProductionsDetailComponent } from './productions-detail/productions-detail.component';

export const productionsRoutes: Routes = [
  { path: '', component: ProductionsListComponent },
  { path: 'new', component: ProductionsFormComponent },
  { path: ':id', component: ProductionsDetailComponent },
  { path: ':id/edit', component: ProductionsFormComponent }
];
