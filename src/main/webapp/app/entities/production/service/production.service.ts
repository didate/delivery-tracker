import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IProduction, NewProduction } from '../production.model';

export type PartialUpdateProduction = Partial<IProduction> & Pick<IProduction, 'id'>;

type RestOf<T extends IProduction | NewProduction> = Omit<T, 'productionDate'> & {
  productionDate?: string | null;
};

export type RestProduction = RestOf<IProduction>;

export type NewRestProduction = RestOf<NewProduction>;

export type PartialUpdateRestProduction = RestOf<PartialUpdateProduction>;

export type EntityResponseType = HttpResponse<IProduction>;
export type EntityArrayResponseType = HttpResponse<IProduction[]>;

@Injectable({ providedIn: 'root' })
export class ProductionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/productions');

  create(production: NewProduction): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(production);
    return this.http
      .post<RestProduction>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(production: IProduction): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(production);
    return this.http
      .put<RestProduction>(`${this.resourceUrl}/${encodeURIComponent(this.getProductionIdentifier(production))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(production: PartialUpdateProduction): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(production);
    return this.http
      .patch<RestProduction>(`${this.resourceUrl}/${encodeURIComponent(this.getProductionIdentifier(production))}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestProduction>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestProduction[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getProductionIdentifier(production: Pick<IProduction, 'id'>): number {
    return production.id;
  }

  compareProduction(o1: Pick<IProduction, 'id'> | null, o2: Pick<IProduction, 'id'> | null): boolean {
    return o1 && o2 ? this.getProductionIdentifier(o1) === this.getProductionIdentifier(o2) : o1 === o2;
  }

  addProductionToCollectionIfMissing<Type extends Pick<IProduction, 'id'>>(
    productionCollection: Type[],
    ...productionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const productions: Type[] = productionsToCheck.filter(isPresent);
    if (productions.length > 0) {
      const productionCollectionIdentifiers = productionCollection.map(productionItem => this.getProductionIdentifier(productionItem));
      const productionsToAdd = productions.filter(productionItem => {
        const productionIdentifier = this.getProductionIdentifier(productionItem);
        if (productionCollectionIdentifiers.includes(productionIdentifier)) {
          return false;
        }
        productionCollectionIdentifiers.push(productionIdentifier);
        return true;
      });
      return [...productionsToAdd, ...productionCollection];
    }
    return productionCollection;
  }

  protected convertDateFromClient<T extends IProduction | NewProduction | PartialUpdateProduction>(production: T): RestOf<T> {
    return {
      ...production,
      productionDate: production.productionDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restProduction: RestProduction): IProduction {
    return {
      ...restProduction,
      productionDate: restProduction.productionDate ? dayjs(restProduction.productionDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestProduction>): HttpResponse<IProduction> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestProduction[]>): HttpResponse<IProduction[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
