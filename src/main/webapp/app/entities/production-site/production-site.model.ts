import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IProductionSite {
  id: number;
  code?: string | null;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  active?: boolean | null;
  tenant?: Pick<ITenant, 'id'> | null;
}

export type NewProductionSite = Omit<IProductionSite, 'id'> & { id: null };
