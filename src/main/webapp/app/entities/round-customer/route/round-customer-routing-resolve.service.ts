import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRoundCustomer } from '../round-customer.model';
import { RoundCustomerService } from '../service/round-customer.service';

const roundCustomerResolve = (route: ActivatedRouteSnapshot): Observable<null | IRoundCustomer> => {
  const id = route.params.id;
  if (id) {
    return inject(RoundCustomerService)
      .find(id)
      .pipe(
        mergeMap((roundCustomer: HttpResponse<IRoundCustomer>) => {
          if (roundCustomer.body) {
            return of(roundCustomer.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default roundCustomerResolve;
