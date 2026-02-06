import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Unauthorized - clear auth state and redirect to login
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url }
          });
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', error.message);
          router.navigate(['/forbidden']);
          break;

        case 404:
          // Not found
          console.error('Resource not found:', error.message);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors - show error notification
          console.error('Server error:', error.message);
          // Here you could inject a notification service to show user-friendly error
          // notificationService.showError('An unexpected server error occurred. Please try again later.');
          break;

        default:
          console.error('HTTP error:', error.status, error.message);
      }

      return throwError(() => error);
    })
  );
};
