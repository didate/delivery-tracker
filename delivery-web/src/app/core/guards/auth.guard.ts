import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isUserAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};

// Guard for routes that should only be accessible when NOT authenticated (e.g., login page)
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isUserAuthenticated()) {
    return true;
  }

  // User is already authenticated, redirect to home
  router.navigate(['/']);
  return false;
};
