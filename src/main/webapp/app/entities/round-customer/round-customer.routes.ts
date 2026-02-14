import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import RoundCustomerResolve from './route/round-customer-routing-resolve.service';

const roundCustomerRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/round-customer').then(m => m.RoundCustomer),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/round-customer-detail').then(m => m.RoundCustomerDetail),
    resolve: {
      roundCustomer: RoundCustomerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/round-customer-update').then(m => m.RoundCustomerUpdate),
    resolve: {
      roundCustomer: RoundCustomerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/round-customer-update').then(m => m.RoundCustomerUpdate),
    resolve: {
      roundCustomer: RoundCustomerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default roundCustomerRoute;
