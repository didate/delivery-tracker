import dayjs from 'dayjs/esm';

import { IProduct } from 'app/entities/product/product.model';
import { IProductionSite } from 'app/entities/production-site/production-site.model';
import { ITenant } from 'app/entities/tenant/tenant.model';

export interface IProduction {
  id: number;
  productionDate?: dayjs.Dayjs | null;
  quantity?: number | null;
  notes?: string | null;
  tenant?: Pick<ITenant, 'id'> | null;
  product?: Pick<IProduct, 'id'> | null;
  productionSite?: Pick<IProductionSite, 'id'> | null;
}

export type NewProduction = Omit<IProduction, 'id'> & { id: null };
