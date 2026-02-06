import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    // canActivate: [authGuard], // Uncomment when auth guard is implemented
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadChildren: () => import('./features/customers/customers.routes').then(m => m.CUSTOMERS_ROUTES)
      },
      {
        path: 'drivers',
        loadChildren: () => import('./features/drivers/drivers.routes').then(m => m.DRIVERS_ROUTES)
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'deliveries',
        loadChildren: () => import('./features/deliveries/deliveries.routes').then(m => m.DELIVERIES_ROUTES)
      },
      {
        path: 'returns',
        loadChildren: () => import('./features/returns/returns.routes').then(m => m.RETURNS_ROUTES)
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENTS_ROUTES)
      },
      {
        path: 'rounds',
        loadChildren: () => import('./features/rounds/rounds.routes').then(m => m.ROUNDS_ROUTES)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
