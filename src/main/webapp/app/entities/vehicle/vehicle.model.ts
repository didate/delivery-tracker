import { VehicleType } from 'app/entities/enumerations/vehicle-type.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IVehicle {
  id: number;
  code?: string | null;
  name?: string | null;
  type?: keyof typeof VehicleType | null;
  brand?: string | null;
  model?: string | null;
  registrationNumber?: string | null;
  year?: number | null;
  capacity?: number | null;
  fuelType?: string | null;
  active?: boolean | null;
  notes?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
}

export type NewVehicle = Omit<IVehicle, 'id'> & { id: null };
