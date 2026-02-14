import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IReturnItem, NewReturnItem } from '../return-item.model';

export type PartialUpdateReturnItem = Partial<IReturnItem> & Pick<IReturnItem, 'id'>;

export type EntityResponseType = HttpResponse<IReturnItem>;
export type EntityArrayResponseType = HttpResponse<IReturnItem[]>;

@Injectable({ providedIn: 'root' })
export class ReturnItemService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/return-items');

  create(returnItem: NewReturnItem): Observable<EntityResponseType> {
    return this.http.post<IReturnItem>(this.resourceUrl, returnItem, { observe: 'response' });
  }

  update(returnItem: IReturnItem): Observable<EntityResponseType> {
    return this.http.put<IReturnItem>(`${this.resourceUrl}/${encodeURIComponent(this.getReturnItemIdentifier(returnItem))}`, returnItem, {
      observe: 'response',
    });
  }

  partialUpdate(returnItem: PartialUpdateReturnItem): Observable<EntityResponseType> {
    return this.http.patch<IReturnItem>(`${this.resourceUrl}/${encodeURIComponent(this.getReturnItemIdentifier(returnItem))}`, returnItem, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IReturnItem>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IReturnItem[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getReturnItemIdentifier(returnItem: Pick<IReturnItem, 'id'>): number {
    return returnItem.id;
  }

  compareReturnItem(o1: Pick<IReturnItem, 'id'> | null, o2: Pick<IReturnItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getReturnItemIdentifier(o1) === this.getReturnItemIdentifier(o2) : o1 === o2;
  }

  addReturnItemToCollectionIfMissing<Type extends Pick<IReturnItem, 'id'>>(
    returnItemCollection: Type[],
    ...returnItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const returnItems: Type[] = returnItemsToCheck.filter(isPresent);
    if (returnItems.length > 0) {
      const returnItemCollectionIdentifiers = returnItemCollection.map(returnItemItem => this.getReturnItemIdentifier(returnItemItem));
      const returnItemsToAdd = returnItems.filter(returnItemItem => {
        const returnItemIdentifier = this.getReturnItemIdentifier(returnItemItem);
        if (returnItemCollectionIdentifiers.includes(returnItemIdentifier)) {
          return false;
        }
        returnItemCollectionIdentifiers.push(returnItemIdentifier);
        return true;
      });
      return [...returnItemsToAdd, ...returnItemCollection];
    }
    return returnItemCollection;
  }
}
