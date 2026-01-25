import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { workGuard } from './core/guards/work.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent, canActivate: [workGuard] },
      {
        path: 'works',
        loadChildren: () => import('./features/works/works.routes').then(m => m.worksRoutes)
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employees/employees.routes').then(m => m.employeesRoutes)
      },
      {
        path: 'equipments',
        loadChildren: () => import('./features/equipments/equipments.routes').then(m => m.equipmentsRoutes)
      },
      {
        path: 'teams',
        loadChildren: () => import('./features/teams/teams.routes').then(m => m.teamsRoutes)
      },
      {
        path: 'towers',
        canActivate: [workGuard],
        loadChildren: () => import('./features/towers/towers.routes').then(m => m.towersRoutes)
      },
      {
        path: 'foundations',
        canActivate: [workGuard],
        loadChildren: () => import('./features/foundations/foundations.routes').then(m => m.foundationsRoutes)
      },
      {
        path: 'tasks',
        canActivate: [workGuard],
        loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.tasksRoutes)
      },
      {
        path: 'productions',
        canActivate: [workGuard],
        loadChildren: () => import('./features/productions/productions.routes').then(m => m.productionsRoutes)
      }
    ]
  },
  {
    path: 'map',
    loadComponent: () => import('./features/map-page/map-page.component').then(m => m.MapPageComponent)
  },
  { path: '**', redirectTo: '' }
];
