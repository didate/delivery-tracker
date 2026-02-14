export interface ITenant {
  id: number;
  code?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  active?: boolean | null;
}

export type NewTenant = Omit<ITenant, 'id'> & { id: null };
