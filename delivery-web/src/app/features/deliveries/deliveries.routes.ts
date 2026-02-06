import { Routes } from '@angular/router';

export const DELIVERIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./deliveries-list.component').then(m => m.DeliveriesListComponent),
    title: 'Deliveries'
  }
];
