import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IExpenseCategory {
  id: number;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  active?: boolean | null;
  tenant?: Pick<ITenant, 'id'> | null;
}

export type NewExpenseCategory = Omit<IExpenseCategory, 'id'> & { id: null };
