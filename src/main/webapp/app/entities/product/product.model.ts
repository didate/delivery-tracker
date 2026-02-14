import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IProduct {
  id: number;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  active?: boolean | null;
  tenant?: Pick<ITenant, 'id'> | null;
}

export type NewProduct = Omit<IProduct, 'id'> & { id: null };
