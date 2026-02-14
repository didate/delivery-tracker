import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IReturnItem } from '../return-item.model';
import { ReturnItemService } from '../service/return-item.service';

const returnItemResolve = (route: ActivatedRouteSnapshot): Observable<null | IReturnItem> => {
  const id = route.params.id;
  if (id) {
    return inject(ReturnItemService)
      .find(id)
      .pipe(
        mergeMap((returnItem: HttpResponse<IReturnItem>) => {
          if (returnItem.body) {
            return of(returnItem.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default returnItemResolve;
