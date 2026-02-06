import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard that prevents authenticated users from accessing guest-only pages (login, register).
 * Redirects authenticated users to the dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);

  // TODO: Replace with actual AuthService check
  // const authService = inject(AuthService);
  // const isAuthenticated = authService.isAuthenticated();

  // For now, check if there's a token in localStorage
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    // User is already logged in, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  // User is not authenticated, allow access to auth pages
  return true;
};
