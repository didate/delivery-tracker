import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ProductReturnResolve from './route/product-return-routing-resolve.service';

const productReturnRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/product-return').then(m => m.ProductReturn),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/product-return-detail').then(m => m.ProductReturnDetail),
    resolve: {
      productReturn: ProductReturnResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/product-return-update').then(m => m.ProductReturnUpdate),
    resolve: {
      productReturn: ProductReturnResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/product-return-update').then(m => m.ProductReturnUpdate),
    resolve: {
      productReturn: ProductReturnResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default productReturnRoute;
