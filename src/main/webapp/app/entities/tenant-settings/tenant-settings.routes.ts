import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import TenantSettingsResolve from './route/tenant-settings-routing-resolve.service';

const tenantSettingsRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/tenant-settings').then(m => m.TenantSettings),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/tenant-settings-detail').then(m => m.TenantSettingsDetail),
    resolve: {
      tenantSettings: TenantSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/tenant-settings-update').then(m => m.TenantSettingsUpdate),
    resolve: {
      tenantSettings: TenantSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/tenant-settings-update').then(m => m.TenantSettingsUpdate),
    resolve: {
      tenantSettings: TenantSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default tenantSettingsRoute;
