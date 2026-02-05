import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { WorkContextService } from '../services/work-context.service';

export const workGuard = () => {
  const workContextService = inject(WorkContextService);
  const router = inject(Router);

  if (workContextService.hasWorkSelected()) {
    return true;
  }

  // Redirect to works list if no work is selected
  return router.parseUrl('/works');
};
