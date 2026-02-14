import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import DeliveryResolve from './route/delivery-routing-resolve.service';

const deliveryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/delivery').then(m => m.Delivery),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/delivery-detail').then(m => m.DeliveryDetail),
    resolve: {
      delivery: DeliveryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/delivery-update').then(m => m.DeliveryUpdate),
    resolve: {
      delivery: DeliveryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/delivery-update').then(m => m.DeliveryUpdate),
    resolve: {
      delivery: DeliveryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default deliveryRoute;
