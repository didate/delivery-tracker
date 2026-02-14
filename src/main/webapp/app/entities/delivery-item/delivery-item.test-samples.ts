import { IDeliveryItem, NewDeliveryItem } from './delivery-item.model';

export const sampleWithRequiredData: IDeliveryItem = {
  id: 15838,
  quantity: 3751,
  unitPrice: 20375.82,
};

export const sampleWithPartialData: IDeliveryItem = {
  id: 21222,
  quantity: 30742.37,
  unitPrice: 32273.27,
};

export const sampleWithFullData: IDeliveryItem = {
  id: 26264,
  quantity: 27484.37,
  unitPrice: 16537.2,
  totalPrice: 26600.15,
};

export const sampleWithNewData: NewDeliveryItem = {
  quantity: 5399.56,
  unitPrice: 14140.73,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
