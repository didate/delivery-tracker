import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPriceHistory, NewPriceHistory } from '../price-history.model';

export type PartialUpdatePriceHistory = Partial<IPriceHistory> & Pick<IPriceHistory, 'id'>;

type RestOf<T extends IPriceHistory | NewPriceHistory> = Omit<T, 'effectiveDate'> & {
  effectiveDate?: string | null;
};

export type RestPriceHistory = RestOf<IPriceHistory>;

export type NewRestPriceHistory = RestOf<NewPriceHistory>;

export type PartialUpdateRestPriceHistory = RestOf<PartialUpdatePriceHistory>;

export type EntityResponseType = HttpResponse<IPriceHistory>;
export type EntityArrayResponseType = HttpResponse<IPriceHistory[]>;

@Injectable({ providedIn: 'root' })
export class PriceHistoryService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/price-histories');

  create(priceHistory: NewPriceHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(priceHistory);
    return this.http
      .post<RestPriceHistory>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(priceHistory: IPriceHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(priceHistory);
    return this.http
      .put<RestPriceHistory>(`${this.resourceUrl}/${encodeURIComponent(this.getPriceHistoryIdentifier(priceHistory))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(priceHistory: PartialUpdatePriceHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(priceHistory);
    return this.http
      .patch<RestPriceHistory>(`${this.resourceUrl}/${encodeURIComponent(this.getPriceHistoryIdentifier(priceHistory))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPriceHistory>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPriceHistory[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getPriceHistoryIdentifier(priceHistory: Pick<IPriceHistory, 'id'>): number {
    return priceHistory.id;
  }

  comparePriceHistory(o1: Pick<IPriceHistory, 'id'> | null, o2: Pick<IPriceHistory, 'id'> | null): boolean {
    return o1 && o2 ? this.getPriceHistoryIdentifier(o1) === this.getPriceHistoryIdentifier(o2) : o1 === o2;
  }

  addPriceHistoryToCollectionIfMissing<Type extends Pick<IPriceHistory, 'id'>>(
    priceHistoryCollection: Type[],
    ...priceHistoriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const priceHistories: Type[] = priceHistoriesToCheck.filter(isPresent);
    if (priceHistories.length > 0) {
      const priceHistoryCollectionIdentifiers = priceHistoryCollection.map(priceHistoryItem =>
        this.getPriceHistoryIdentifier(priceHistoryItem),
      );
      const priceHistoriesToAdd = priceHistories.filter(priceHistoryItem => {
        const priceHistoryIdentifier = this.getPriceHistoryIdentifier(priceHistoryItem);
        if (priceHistoryCollectionIdentifiers.includes(priceHistoryIdentifier)) {
          return false;
        }
        priceHistoryCollectionIdentifiers.push(priceHistoryIdentifier);
        return true;
      });
      return [...priceHistoriesToAdd, ...priceHistoryCollection];
    }
    return priceHistoryCollection;
  }

  protected convertDateFromClient<T extends IPriceHistory | NewPriceHistory | PartialUpdatePriceHistory>(priceHistory: T): RestOf<T> {
    return {
      ...priceHistory,
      effectiveDate: priceHistory.effectiveDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restPriceHistory: RestPriceHistory): IPriceHistory {
    return {
      ...restPriceHistory,
      effectiveDate: restPriceHistory.effectiveDate ? dayjs(restPriceHistory.effectiveDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPriceHistory>): HttpResponse<IPriceHistory> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPriceHistory[]>): HttpResponse<IPriceHistory[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
