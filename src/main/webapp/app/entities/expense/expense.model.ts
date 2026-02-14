import dayjs from 'dayjs/esm';

import { IDriver } from 'app/entities/driver/driver.model';
import { IExpenseCategory } from 'app/entities/expense-category/expense-category.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IExpense {
  id: number;
  expenseDate?: dayjs.Dayjs | null;
  amount?: number | null;
  description?: string | null;
  receiptUrl?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
  category?: Pick<IExpenseCategory, 'id'> | null;
  driver?: Pick<IDriver, 'id'> | null;
}

export type NewExpense = Omit<IExpense, 'id'> & { id: null };
