export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  settings?: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  theme?: string;
  language?: string;
  timezone?: string;
  [key: string]: string | undefined;
}
