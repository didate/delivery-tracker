import dayjs from 'dayjs/esm';

import { IDriver } from 'app/entities/driver/driver.model';
import { RoundStatus } from 'app/entities/enumerations/round-status.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IRound {
  id: number;
  name?: string | null;
  roundDate?: dayjs.Dayjs | null;
  status?: keyof typeof RoundStatus | null;
  startTime?: dayjs.Dayjs | null;
  endTime?: dayjs.Dayjs | null;
  notes?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
  driver?: Pick<IDriver, 'id'> | null;
}

export type NewRound = Omit<IRound, 'id'> & { id: null };
