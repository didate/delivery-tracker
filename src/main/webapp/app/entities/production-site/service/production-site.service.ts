import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IProductionSite, NewProductionSite } from '../production-site.model';

export type PartialUpdateProductionSite = Partial<IProductionSite> & Pick<IProductionSite, 'id'>;

export type EntityResponseType = HttpResponse<IProductionSite>;
export type EntityArrayResponseType = HttpResponse<IProductionSite[]>;

@Injectable({ providedIn: 'root' })
export class ProductionSiteService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/production-sites');

  create(productionSite: NewProductionSite): Observable<EntityResponseType> {
    return this.http.post<IProductionSite>(this.resourceUrl, productionSite, { observe: 'response' });
  }

  update(productionSite: IProductionSite): Observable<EntityResponseType> {
    return this.http.put<IProductionSite>(
      `${this.resourceUrl}/${encodeURIComponent(this.getProductionSiteIdentifier(productionSite))}`,
      productionSite,
      { observe: 'response' },
    );
  }

  partialUpdate(productionSite: PartialUpdateProductionSite): Observable<EntityResponseType> {
    return this.http.patch<IProductionSite>(
      `${this.resourceUrl}/${encodeURIComponent(this.getProductionSiteIdentifier(productionSite))}`,
      productionSite,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IProductionSite>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProductionSite[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getProductionSiteIdentifier(productionSite: Pick<IProductionSite, 'id'>): number {
    return productionSite.id;
  }

  compareProductionSite(o1: Pick<IProductionSite, 'id'> | null, o2: Pick<IProductionSite, 'id'> | null): boolean {
    return o1 && o2 ? this.getProductionSiteIdentifier(o1) === this.getProductionSiteIdentifier(o2) : o1 === o2;
  }

  addProductionSiteToCollectionIfMissing<Type extends Pick<IProductionSite, 'id'>>(
    productionSiteCollection: Type[],
    ...productionSitesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const productionSites: Type[] = productionSitesToCheck.filter(isPresent);
    if (productionSites.length > 0) {
      const productionSiteCollectionIdentifiers = productionSiteCollection.map(productionSiteItem =>
        this.getProductionSiteIdentifier(productionSiteItem),
      );
      const productionSitesToAdd = productionSites.filter(productionSiteItem => {
        const productionSiteIdentifier = this.getProductionSiteIdentifier(productionSiteItem);
        if (productionSiteCollectionIdentifiers.includes(productionSiteIdentifier)) {
          return false;
        }
        productionSiteCollectionIdentifiers.push(productionSiteIdentifier);
        return true;
      });
      return [...productionSitesToAdd, ...productionSiteCollection];
    }
    return productionSiteCollection;
  }
}
