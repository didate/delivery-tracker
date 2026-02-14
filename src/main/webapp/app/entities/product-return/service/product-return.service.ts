import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IProductReturn, NewProductReturn } from '../product-return.model';

export type PartialUpdateProductReturn = Partial<IProductReturn> & Pick<IProductReturn, 'id'>;

type RestOf<T extends IProductReturn | NewProductReturn> = Omit<T, 'returnDate'> & {
  returnDate?: string | null;
};

export type RestProductReturn = RestOf<IProductReturn>;

export type NewRestProductReturn = RestOf<NewProductReturn>;

export type PartialUpdateRestProductReturn = RestOf<PartialUpdateProductReturn>;

export type EntityResponseType = HttpResponse<IProductReturn>;
export type EntityArrayResponseType = HttpResponse<IProductReturn[]>;

@Injectable({ providedIn: 'root' })
export class ProductReturnService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/product-returns');

  create(productReturn: NewProductReturn): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(productReturn);
    return this.http
      .post<RestProductReturn>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(productReturn: IProductReturn): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(productReturn);
    return this.http
      .put<RestProductReturn>(`${this.resourceUrl}/${encodeURIComponent(this.getProductReturnIdentifier(productReturn))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(productReturn: PartialUpdateProductReturn): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(productReturn);
    return this.http
      .patch<RestProductReturn>(`${this.resourceUrl}/${encodeURIComponent(this.getProductReturnIdentifier(productReturn))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestProductReturn>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestProductReturn[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getProductReturnIdentifier(productReturn: Pick<IProductReturn, 'id'>): number {
    return productReturn.id;
  }

  compareProductReturn(o1: Pick<IProductReturn, 'id'> | null, o2: Pick<IProductReturn, 'id'> | null): boolean {
    return o1 && o2 ? this.getProductReturnIdentifier(o1) === this.getProductReturnIdentifier(o2) : o1 === o2;
  }

  addProductReturnToCollectionIfMissing<Type extends Pick<IProductReturn, 'id'>>(
    productReturnCollection: Type[],
    ...productReturnsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const productReturns: Type[] = productReturnsToCheck.filter(isPresent);
    if (productReturns.length > 0) {
      const productReturnCollectionIdentifiers = productReturnCollection.map(productReturnItem =>
        this.getProductReturnIdentifier(productReturnItem),
      );
      const productReturnsToAdd = productReturns.filter(productReturnItem => {
        const productReturnIdentifier = this.getProductReturnIdentifier(productReturnItem);
        if (productReturnCollectionIdentifiers.includes(productReturnIdentifier)) {
          return false;
        }
        productReturnCollectionIdentifiers.push(productReturnIdentifier);
        return true;
      });
      return [...productReturnsToAdd, ...productReturnCollection];
    }
    return productReturnCollection;
  }

  protected convertDateFromClient<T extends IProductReturn | NewProductReturn | PartialUpdateProductReturn>(productReturn: T): RestOf<T> {
    return {
      ...productReturn,
      returnDate: productReturn.returnDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restProductReturn: RestProductReturn): IProductReturn {
    return {
      ...restProductReturn,
      returnDate: restProductReturn.returnDate ? dayjs(restProductReturn.returnDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestProductReturn>): HttpResponse<IProductReturn> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestProductReturn[]>): HttpResponse<IProductReturn[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
