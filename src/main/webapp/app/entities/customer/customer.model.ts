import { IDriver } from 'app/entities/driver/driver.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface ICustomer {
  id: number;
  code?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  active?: boolean | null;
  notes?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
  driver?: Pick<IDriver, 'id'> | null;
}

export type NewCustomer = Omit<ICustomer, 'id'> & { id: null };
