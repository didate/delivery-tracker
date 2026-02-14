import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IDriver, NewDriver } from '../driver.model';

export type PartialUpdateDriver = Partial<IDriver> & Pick<IDriver, 'id'>;

export type EntityResponseType = HttpResponse<IDriver>;
export type EntityArrayResponseType = HttpResponse<IDriver[]>;

@Injectable({ providedIn: 'root' })
export class DriverService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/drivers');

  create(driver: NewDriver): Observable<EntityResponseType> {
    return this.http.post<IDriver>(this.resourceUrl, driver, { observe: 'response' });
  }

  update(driver: IDriver): Observable<EntityResponseType> {
    return this.http.put<IDriver>(`${this.resourceUrl}/${encodeURIComponent(this.getDriverIdentifier(driver))}`, driver, {
      observe: 'response',
    });
  }

  partialUpdate(driver: PartialUpdateDriver): Observable<EntityResponseType> {
    return this.http.patch<IDriver>(`${this.resourceUrl}/${encodeURIComponent(this.getDriverIdentifier(driver))}`, driver, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IDriver>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IDriver[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getDriverIdentifier(driver: Pick<IDriver, 'id'>): number {
    return driver.id;
  }

  compareDriver(o1: Pick<IDriver, 'id'> | null, o2: Pick<IDriver, 'id'> | null): boolean {
    return o1 && o2 ? this.getDriverIdentifier(o1) === this.getDriverIdentifier(o2) : o1 === o2;
  }

  addDriverToCollectionIfMissing<Type extends Pick<IDriver, 'id'>>(
    driverCollection: Type[],
    ...driversToCheck: (Type | null | undefined)[]
  ): Type[] {
    const drivers: Type[] = driversToCheck.filter(isPresent);
    if (drivers.length > 0) {
      const driverCollectionIdentifiers = driverCollection.map(driverItem => this.getDriverIdentifier(driverItem));
      const driversToAdd = drivers.filter(driverItem => {
        const driverIdentifier = this.getDriverIdentifier(driverItem);
        if (driverCollectionIdentifiers.includes(driverIdentifier)) {
          return false;
        }
        driverCollectionIdentifiers.push(driverIdentifier);
        return true;
      });
      return [...driversToAdd, ...driverCollection];
    }
    return driverCollection;
  }
}
