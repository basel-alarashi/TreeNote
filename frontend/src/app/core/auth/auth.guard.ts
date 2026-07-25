import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Always allows access for now — always true until Sprint 4 has a real login
// page to redirect to. The seam exists so route config doesn't change later.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;
  return inject(Router).parseUrl('/login');
};
