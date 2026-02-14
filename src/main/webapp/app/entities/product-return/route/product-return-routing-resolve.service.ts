import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IProductReturn } from '../product-return.model';
import { ProductReturnService } from '../service/product-return.service';

const productReturnResolve = (route: ActivatedRouteSnapshot): Observable<null | IProductReturn> => {
  const id = route.params.id;
  if (id) {
    return inject(ProductReturnService)
      .find(id)
      .pipe(
        mergeMap((productReturn: HttpResponse<IProductReturn>) => {
          if (productReturn.body) {
            return of(productReturn.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default productReturnResolve;
