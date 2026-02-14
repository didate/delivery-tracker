import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PriceHistoryResolve from './route/price-history-routing-resolve.service';

const priceHistoryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/price-history').then(m => m.PriceHistory),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/price-history-detail').then(m => m.PriceHistoryDetail),
    resolve: {
      priceHistory: PriceHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/price-history-update').then(m => m.PriceHistoryUpdate),
    resolve: {
      priceHistory: PriceHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/price-history-update').then(m => m.PriceHistoryUpdate),
    resolve: {
      priceHistory: PriceHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default priceHistoryRoute;
