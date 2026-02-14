import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IRoundCustomer, NewRoundCustomer } from '../round-customer.model';

export type PartialUpdateRoundCustomer = Partial<IRoundCustomer> & Pick<IRoundCustomer, 'id'>;

type RestOf<T extends IRoundCustomer | NewRoundCustomer> = Omit<T, 'visitTime'> & {
  visitTime?: string | null;
};

export type RestRoundCustomer = RestOf<IRoundCustomer>;

export type NewRestRoundCustomer = RestOf<NewRoundCustomer>;

export type PartialUpdateRestRoundCustomer = RestOf<PartialUpdateRoundCustomer>;

export type EntityResponseType = HttpResponse<IRoundCustomer>;
export type EntityArrayResponseType = HttpResponse<IRoundCustomer[]>;

@Injectable({ providedIn: 'root' })
export class RoundCustomerService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/round-customers');

  create(roundCustomer: NewRoundCustomer): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(roundCustomer);
    return this.http
      .post<RestRoundCustomer>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(roundCustomer: IRoundCustomer): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(roundCustomer);
    return this.http
      .put<RestRoundCustomer>(`${this.resourceUrl}/${encodeURIComponent(this.getRoundCustomerIdentifier(roundCustomer))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(roundCustomer: PartialUpdateRoundCustomer): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(roundCustomer);
    return this.http
      .patch<RestRoundCustomer>(`${this.resourceUrl}/${encodeURIComponent(this.getRoundCustomerIdentifier(roundCustomer))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestRoundCustomer>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestRoundCustomer[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getRoundCustomerIdentifier(roundCustomer: Pick<IRoundCustomer, 'id'>): number {
    return roundCustomer.id;
  }

  compareRoundCustomer(o1: Pick<IRoundCustomer, 'id'> | null, o2: Pick<IRoundCustomer, 'id'> | null): boolean {
    return o1 && o2 ? this.getRoundCustomerIdentifier(o1) === this.getRoundCustomerIdentifier(o2) : o1 === o2;
  }

  addRoundCustomerToCollectionIfMissing<Type extends Pick<IRoundCustomer, 'id'>>(
    roundCustomerCollection: Type[],
    ...roundCustomersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const roundCustomers: Type[] = roundCustomersToCheck.filter(isPresent);
    if (roundCustomers.length > 0) {
      const roundCustomerCollectionIdentifiers = roundCustomerCollection.map(roundCustomerItem =>
        this.getRoundCustomerIdentifier(roundCustomerItem),
      );
      const roundCustomersToAdd = roundCustomers.filter(roundCustomerItem => {
        const roundCustomerIdentifier = this.getRoundCustomerIdentifier(roundCustomerItem);
        if (roundCustomerCollectionIdentifiers.includes(roundCustomerIdentifier)) {
          return false;
        }
        roundCustomerCollectionIdentifiers.push(roundCustomerIdentifier);
        return true;
      });
      return [...roundCustomersToAdd, ...roundCustomerCollection];
    }
    return roundCustomerCollection;
  }

  protected convertDateFromClient<T extends IRoundCustomer | NewRoundCustomer | PartialUpdateRoundCustomer>(roundCustomer: T): RestOf<T> {
    return {
      ...roundCustomer,
      visitTime: roundCustomer.visitTime?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restRoundCustomer: RestRoundCustomer): IRoundCustomer {
    return {
      ...restRoundCustomer,
      visitTime: restRoundCustomer.visitTime ? dayjs(restRoundCustomer.visitTime) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestRoundCustomer>): HttpResponse<IRoundCustomer> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestRoundCustomer[]>): HttpResponse<IRoundCustomer[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
