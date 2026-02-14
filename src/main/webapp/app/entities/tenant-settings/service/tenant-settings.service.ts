import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ITenantSettings, NewTenantSettings } from '../tenant-settings.model';

export type PartialUpdateTenantSettings = Partial<ITenantSettings> & Pick<ITenantSettings, 'id'>;

export type EntityResponseType = HttpResponse<ITenantSettings>;
export type EntityArrayResponseType = HttpResponse<ITenantSettings[]>;

@Injectable({ providedIn: 'root' })
export class TenantSettingsService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tenant-settings');

  create(tenantSettings: NewTenantSettings): Observable<EntityResponseType> {
    return this.http.post<ITenantSettings>(this.resourceUrl, tenantSettings, { observe: 'response' });
  }

  update(tenantSettings: ITenantSettings): Observable<EntityResponseType> {
    return this.http.put<ITenantSettings>(
      `${this.resourceUrl}/${encodeURIComponent(this.getTenantSettingsIdentifier(tenantSettings))}`,
      tenantSettings,
      { observe: 'response' },
    );
  }

  partialUpdate(tenantSettings: PartialUpdateTenantSettings): Observable<EntityResponseType> {
    return this.http.patch<ITenantSettings>(
      `${this.resourceUrl}/${encodeURIComponent(this.getTenantSettingsIdentifier(tenantSettings))}`,
      tenantSettings,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITenantSettings>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITenantSettings[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getTenantSettingsIdentifier(tenantSettings: Pick<ITenantSettings, 'id'>): number {
    return tenantSettings.id;
  }

  compareTenantSettings(o1: Pick<ITenantSettings, 'id'> | null, o2: Pick<ITenantSettings, 'id'> | null): boolean {
    return o1 && o2 ? this.getTenantSettingsIdentifier(o1) === this.getTenantSettingsIdentifier(o2) : o1 === o2;
  }

  addTenantSettingsToCollectionIfMissing<Type extends Pick<ITenantSettings, 'id'>>(
    tenantSettingsCollection: Type[],
    ...tenantSettingsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const tenantSettings: Type[] = tenantSettingsToCheck.filter(isPresent);
    if (tenantSettings.length > 0) {
      const tenantSettingsCollectionIdentifiers = tenantSettingsCollection.map(tenantSettingsItem =>
        this.getTenantSettingsIdentifier(tenantSettingsItem),
      );
      const tenantSettingsToAdd = tenantSettings.filter(tenantSettingsItem => {
        const tenantSettingsIdentifier = this.getTenantSettingsIdentifier(tenantSettingsItem);
        if (tenantSettingsCollectionIdentifiers.includes(tenantSettingsIdentifier)) {
          return false;
        }
        tenantSettingsCollectionIdentifiers.push(tenantSettingsIdentifier);
        return true;
      });
      return [...tenantSettingsToAdd, ...tenantSettingsCollection];
    }
    return tenantSettingsCollection;
  }
}
