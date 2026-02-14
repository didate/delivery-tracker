import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import DeliveryItemResolve from './route/delivery-item-routing-resolve.service';

const deliveryItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/delivery-item').then(m => m.DeliveryItem),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/delivery-item-detail').then(m => m.DeliveryItemDetail),
    resolve: {
      deliveryItem: DeliveryItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/delivery-item-update').then(m => m.DeliveryItemUpdate),
    resolve: {
      deliveryItem: DeliveryItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/delivery-item-update').then(m => m.DeliveryItemUpdate),
    resolve: {
      deliveryItem: DeliveryItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default deliveryItemRoute;
