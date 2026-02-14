import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ProductionSiteResolve from './route/production-site-routing-resolve.service';

const productionSiteRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/production-site').then(m => m.ProductionSite),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/production-site-detail').then(m => m.ProductionSiteDetail),
    resolve: {
      productionSite: ProductionSiteResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/production-site-update').then(m => m.ProductionSiteUpdate),
    resolve: {
      productionSite: ProductionSiteResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/production-site-update').then(m => m.ProductionSiteUpdate),
    resolve: {
      productionSite: ProductionSiteResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default productionSiteRoute;
