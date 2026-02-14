import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IProduction } from '../production.model';
import { ProductionService } from '../service/production.service';

const productionResolve = (route: ActivatedRouteSnapshot): Observable<null | IProduction> => {
  const id = route.params.id;
  if (id) {
    return inject(ProductionService)
      .find(id)
      .pipe(
        mergeMap((production: HttpResponse<IProduction>) => {
          if (production.body) {
            return of(production.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default productionResolve;
