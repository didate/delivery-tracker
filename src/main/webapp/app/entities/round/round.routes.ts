import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import RoundResolve from './route/round-routing-resolve.service';

const roundRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/round').then(m => m.Round),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/round-detail').then(m => m.RoundDetail),
    resolve: {
      round: RoundResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/round-update').then(m => m.RoundUpdate),
    resolve: {
      round: RoundResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/round-update').then(m => m.RoundUpdate),
    resolve: {
      round: RoundResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default roundRoute;
