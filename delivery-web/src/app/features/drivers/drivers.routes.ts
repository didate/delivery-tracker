import { Routes } from '@angular/router';

export const DRIVERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./drivers-list.component').then(m => m.DriversListComponent),
    title: 'Drivers'
  }
];
