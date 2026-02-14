import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { TenantSettingsService } from '../service/tenant-settings.service';
import { ITenantSettings } from '../tenant-settings.model';

const tenantSettingsResolve = (route: ActivatedRouteSnapshot): Observable<null | ITenantSettings> => {
  const id = route.params.id;
  if (id) {
    return inject(TenantSettingsService)
      .find(id)
      .pipe(
        mergeMap((tenantSettings: HttpResponse<ITenantSettings>) => {
          if (tenantSettings.body) {
            return of(tenantSettings.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default tenantSettingsResolve;
