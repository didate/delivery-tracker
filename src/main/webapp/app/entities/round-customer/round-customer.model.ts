import dayjs from 'dayjs/esm';

import { ICustomer } from 'app/entities/customer/customer.model';
import { IRound } from 'app/entities/round/round.model';

export interface IRoundCustomer {
  id: number;
  sequenceOrder?: number | null;
  visited?: boolean | null;
  visitTime?: dayjs.Dayjs | null;
  notes?: string | null;
  round?: Pick<IRound, 'id'> | null;
  customer?: Pick<ICustomer, 'id'> | null;
}

export type NewRoundCustomer = Omit<IRoundCustomer, 'id'> & { id: null };
