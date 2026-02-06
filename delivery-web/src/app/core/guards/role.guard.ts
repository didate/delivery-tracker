import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isUserAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[] | undefined;

  // If no roles are specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required role, redirect to forbidden page
  router.navigate(['/forbidden']);
  return false;
};

// Factory function to create a role guard with specific roles
export const hasRole = (...roles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isUserAuthenticated()) {
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    if (authService.hasAnyRole(roles)) {
      return true;
    }

    router.navigate(['/forbidden']);
    return false;
  };
};
