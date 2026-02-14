import dayjs from 'dayjs/esm';

import { ICustomer } from 'app/entities/customer/customer.model';
import { IDelivery } from 'app/entities/delivery/delivery.model';
import { ReturnReason } from 'app/entities/enumerations/return-reason.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IProductReturn {
  id: number;
  returnDate?: dayjs.Dayjs | null;
  reason?: keyof typeof ReturnReason | null;
  notes?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
  customer?: Pick<ICustomer, 'id'> | null;
  delivery?: Pick<IDelivery, 'id'> | null;
}

export type NewProductReturn = Omit<IProductReturn, 'id'> & { id: null };
