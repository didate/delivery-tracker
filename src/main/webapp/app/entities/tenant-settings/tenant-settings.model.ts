import { ITenant } from 'app/entities/tenant/tenant.model';

export interface ITenantSettings {
  id: number;
  currency?: string | null;
  timezone?: string | null;
  dateFormat?: string | null;
  language?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
}

export type NewTenantSettings = Omit<ITenantSettings, 'id'> & { id: null };
