import { ITenant } from 'app/entities/tenant/tenant.model';
import { IVehicle } from 'app/entities/vehicle/vehicle.model';

export interface IDriver {
  id: number;
  code?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
  active?: boolean | null;
  tenant?: Pick<ITenant, 'id'> | null;
  vehicle?: Pick<IVehicle, 'id'> | null;
}

export type NewDriver = Omit<IDriver, 'id'> & { id: null };
