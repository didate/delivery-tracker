import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./products-list.component').then(m => m.ProductsListComponent),
    title: 'Products'
  }
];
