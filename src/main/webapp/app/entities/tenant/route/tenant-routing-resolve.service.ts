import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { TenantService } from '../service/tenant.service';
import { ITenant } from '../tenant.model';

const tenantResolve = (route: ActivatedRouteSnapshot): Observable<null | ITenant> => {
  const id = route.params.id;
  if (id) {
    return inject(TenantService)
      .find(id)
      .pipe(
        mergeMap((tenant: HttpResponse<ITenant>) => {
          if (tenant.body) {
            return of(tenant.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default tenantResolve;
