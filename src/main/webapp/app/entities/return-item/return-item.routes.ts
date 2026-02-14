import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ReturnItemResolve from './route/return-item-routing-resolve.service';

const returnItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/return-item').then(m => m.ReturnItem),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/return-item-detail').then(m => m.ReturnItemDetail),
    resolve: {
      returnItem: ReturnItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/return-item-update').then(m => m.ReturnItemUpdate),
    resolve: {
      returnItem: ReturnItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/return-item-update').then(m => m.ReturnItemUpdate),
    resolve: {
      returnItem: ReturnItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default returnItemRoute;
