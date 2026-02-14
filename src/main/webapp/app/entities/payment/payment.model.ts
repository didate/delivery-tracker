import dayjs from 'dayjs/esm';

import { ICustomer } from 'app/entities/customer/customer.model';
import { IDelivery } from 'app/entities/delivery/delivery.model';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IPayment {
  id: number;
  paymentDate?: dayjs.Dayjs | null;
  amount?: number | null;
  method?: keyof typeof PaymentMethod | null;
  reference?: string | null;
  notes?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
  customer?: Pick<ICustomer, 'id'> | null;
  delivery?: Pick<IDelivery, 'id'> | null;
}

export type NewPayment = Omit<IPayment, 'id'> & { id: null };
