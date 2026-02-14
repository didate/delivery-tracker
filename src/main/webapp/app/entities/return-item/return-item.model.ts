import { IProduct } from 'app/entities/product/product.model';
import { IProductReturn } from 'app/entities/product-return/product-return.model';

export interface IReturnItem {
  id: number;
  quantity?: number | null;
  unitPrice?: number | null;
  productReturn?: Pick<IProductReturn, 'id'> | null;
  product?: Pick<IProduct, 'id'> | null;
}

export type NewReturnItem = Omit<IReturnItem, 'id'> & { id: null };
