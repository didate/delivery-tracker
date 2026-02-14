import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ProductionResolve from './route/production-routing-resolve.service';

const productionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/production').then(m => m.Production),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/production-detail').then(m => m.ProductionDetail),
    resolve: {
      production: ProductionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/production-update').then(m => m.ProductionUpdate),
    resolve: {
      production: ProductionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/production-update').then(m => m.ProductionUpdate),
    resolve: {
      production: ProductionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default productionRoute;
