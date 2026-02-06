import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Tenant, TenantSettings } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly api = inject(ApiService);

  // Reactive state using signals
  private readonly currentTenantSignal = signal<Tenant | null>(null);
  private readonly settingsSignal = signal<Map<string, string>>(new Map());

  // Public readonly signals
  readonly currentTenant = this.currentTenantSignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();

  getCurrentTenant(): Observable<Tenant> {
    return this.api.get<Tenant>('/tenant/current').pipe(
      tap(tenant => this.currentTenantSignal.set(tenant))
    );
  }

  getTenantById(id: string): Observable<Tenant> {
    return this.api.get<Tenant>(`/tenants/${id}`);
  }

  updateTenant(data: Partial<Tenant>): Observable<Tenant> {
    return this.api.patch<Tenant>('/tenant/current', data).pipe(
      tap(tenant => this.currentTenantSignal.set(tenant))
    );
  }

  getSettings(): Observable<Map<string, string>> {
    return this.api.get<TenantSettings>('/tenant/current/settings').pipe(
      tap(settings => {
        const settingsMap = new Map<string, string>();
        if (settings) {
          Object.entries(settings).forEach(([key, value]) => {
            if (value !== undefined) {
              settingsMap.set(key, value);
            }
          });
        }
        this.settingsSignal.set(settingsMap);
      }),
      // Transform the response to Map
      tap(() => {}),
      // Return the signal value
      tap(() => this.settingsSignal())
    ) as unknown as Observable<Map<string, string>>;
  }

  updateSettings(settings: TenantSettings): Observable<TenantSettings> {
    return this.api.patch<TenantSettings>('/tenant/current/settings', settings).pipe(
      tap(updatedSettings => {
        const settingsMap = new Map<string, string>();
        Object.entries(updatedSettings).forEach(([key, value]) => {
          if (value !== undefined) {
            settingsMap.set(key, value);
          }
        });
        this.settingsSignal.set(settingsMap);
      })
    );
  }

  getSetting(key: string): string | undefined {
    return this.settingsSignal().get(key);
  }

  clearTenantData(): void {
    this.currentTenantSignal.set(null);
    this.settingsSignal.set(new Map());
  }
}
