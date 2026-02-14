import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRound } from '../round.model';
import { RoundService } from '../service/round.service';

const roundResolve = (route: ActivatedRouteSnapshot): Observable<null | IRound> => {
  const id = route.params.id;
  if (id) {
    return inject(RoundService)
      .find(id)
      .pipe(
        mergeMap((round: HttpResponse<IRound>) => {
          if (round.body) {
            return of(round.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default roundResolve;
