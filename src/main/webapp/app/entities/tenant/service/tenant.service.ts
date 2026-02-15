import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ITenant, NewTenant } from '../tenant.model';

export type PartialUpdateTenant = Partial<ITenant> & Pick<ITenant, 'id'>;

export type EntityResponseType = HttpResponse<ITenant>;
export type EntityArrayResponseType = HttpResponse<ITenant[]>;

export interface SwitchTenantResponse {
  id_token: string;
  tenant: ITenant;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tenants');

  create(tenant: NewTenant): Observable<EntityResponseType> {
    return this.http.post<ITenant>(this.resourceUrl, tenant, { observe: 'response' });
  }

  update(tenant: ITenant): Observable<EntityResponseType> {
    return this.http.put<ITenant>(`${this.resourceUrl}/${encodeURIComponent(this.getTenantIdentifier(tenant))}`, tenant, {
      observe: 'response',
    });
  }

  partialUpdate(tenant: PartialUpdateTenant): Observable<EntityResponseType> {
    return this.http.patch<ITenant>(`${this.resourceUrl}/${encodeURIComponent(this.getTenantIdentifier(tenant))}`, tenant, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITenant>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITenant[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getTenantIdentifier(tenant: Pick<ITenant, 'id'>): number {
    return tenant.id;
  }

  compareTenant(o1: Pick<ITenant, 'id'> | null, o2: Pick<ITenant, 'id'> | null): boolean {
    return o1 && o2 ? this.getTenantIdentifier(o1) === this.getTenantIdentifier(o2) : o1 === o2;
  }

  addTenantToCollectionIfMissing<Type extends Pick<ITenant, 'id'>>(
    tenantCollection: Type[],
    ...tenantsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const tenants: Type[] = tenantsToCheck.filter(isPresent);
    if (tenants.length > 0) {
      const tenantCollectionIdentifiers = tenantCollection.map(tenantItem => this.getTenantIdentifier(tenantItem));
      const tenantsToAdd = tenants.filter(tenantItem => {
        const tenantIdentifier = this.getTenantIdentifier(tenantItem);
        if (tenantCollectionIdentifiers.includes(tenantIdentifier)) {
          return false;
        }
        tenantCollectionIdentifiers.push(tenantIdentifier);
        return true;
      });
      return [...tenantsToAdd, ...tenantCollection];
    }
    return tenantCollection;
  }

  /**
   * Switch to a different tenant (ADMIN only).
   * Returns a new JWT token for the selected tenant.
   */
  switchTenant(tenantId: number): Observable<HttpResponse<SwitchTenantResponse>> {
    return this.http.post<SwitchTenantResponse>(`${this.resourceUrl}/${tenantId}/switch`, {}, { observe: 'response' });
  }

  /**
   * Get all active tenants for the switcher dropdown.
   */
  getAllActive(): Observable<EntityArrayResponseType> {
    return this.query({ 'active.equals': true, sort: 'name,asc', size: 1000 });
  }
}
