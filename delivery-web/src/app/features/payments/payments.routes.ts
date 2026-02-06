import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payments-list.component').then(m => m.PaymentsListComponent),
    title: 'Payments'
  }
];
