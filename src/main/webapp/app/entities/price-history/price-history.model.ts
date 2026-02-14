import dayjs from 'dayjs/esm';

import { IProduct } from 'app/entities/product/product.model';

export interface IPriceHistory {
  id: number;
  price?: number | null;
  effectiveDate?: dayjs.Dayjs | null;
  product?: Pick<IProduct, 'id'> | null;
}

export type NewPriceHistory = Omit<IPriceHistory, 'id'> & { id: null };
