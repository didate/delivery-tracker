import { IDelivery } from 'app/entities/delivery/delivery.model';
import { IProduct } from 'app/entities/product/product.model';

export interface IDeliveryItem {
  id: number;
  quantity?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  delivery?: Pick<IDelivery, 'id'> | null;
  product?: Pick<IProduct, 'id'> | null;
}

export type NewDeliveryItem = Omit<IDeliveryItem, 'id'> & { id: null };
