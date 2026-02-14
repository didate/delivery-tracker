import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import VehicleResolve from './route/vehicle-routing-resolve.service';

const vehicleRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/vehicle').then(m => m.Vehicle),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/vehicle-detail').then(m => m.VehicleDetail),
    resolve: {
      vehicle: VehicleResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/vehicle-update').then(m => m.VehicleUpdate),
    resolve: {
      vehicle: VehicleResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/vehicle-update').then(m => m.VehicleUpdate),
    resolve: {
      vehicle: VehicleResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default vehicleRoute;
