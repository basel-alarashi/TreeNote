import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if auth is initialized
  const isAuthenticated = await authService.whenReady();

  if (isAuthenticated) {
    return true;
  }

  // Not authenticated, redirect to login
  router.navigate(['/login']);
  return false;
};
