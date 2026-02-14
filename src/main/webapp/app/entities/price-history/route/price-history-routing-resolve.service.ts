import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPriceHistory } from '../price-history.model';
import { PriceHistoryService } from '../service/price-history.service';

const priceHistoryResolve = (route: ActivatedRouteSnapshot): Observable<null | IPriceHistory> => {
  const id = route.params.id;
  if (id) {
    return inject(PriceHistoryService)
      .find(id)
      .pipe(
        mergeMap((priceHistory: HttpResponse<IPriceHistory>) => {
          if (priceHistory.body) {
            return of(priceHistory.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default priceHistoryResolve;
