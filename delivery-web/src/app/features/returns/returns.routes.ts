import { Routes } from '@angular/router';

export const RETURNS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./returns-list.component').then(m => m.ReturnsListComponent),
    title: 'Returns'
  }
];
