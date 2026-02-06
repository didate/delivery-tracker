import { Routes } from '@angular/router';

export const ROUNDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rounds-list.component').then(m => m.RoundsListComponent),
    title: 'Rounds'
  }
];
