import dayjs from 'dayjs/esm';

import { ICustomer } from 'app/entities/customer/customer.model';
import { IDriver } from 'app/entities/driver/driver.model';
import { DeliveryStatus } from 'app/entities/enumerations/delivery-status.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IDelivery {
  id: number;
  deliveryDate?: dayjs.Dayjs | null;
  status?: keyof typeof DeliveryStatus | null;
  totalAmount?: number | null;
  paidAmount?: number | null;
  notes?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
  customer?: Pick<ICustomer, 'id'> | null;
  driver?: Pick<IDriver, 'id'> | null;
}

export type NewDelivery = Omit<IDelivery, 'id'> & { id: null };
