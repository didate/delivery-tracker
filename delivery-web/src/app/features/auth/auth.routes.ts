import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards';
import { AuthLayoutComponent } from './auth-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login.component').then((m) => m.LoginComponent),
        title: 'Sign In - Delivery',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register/register.component').then((m) => m.RegisterComponent),
        title: 'Create Account - Delivery',
      },
    ],
  },
];
