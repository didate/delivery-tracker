import { IReturnItem, NewReturnItem } from './return-item.model';

export const sampleWithRequiredData: IReturnItem = {
  id: 21671,
  quantity: 20883.83,
};

export const sampleWithPartialData: IReturnItem = {
  id: 28473,
  quantity: 21132.22,
  unitPrice: 29747.72,
};

export const sampleWithFullData: IReturnItem = {
  id: 378,
  quantity: 3205.61,
  unitPrice: 2238.1,
};

export const sampleWithNewData: NewReturnItem = {
  quantity: 24194.52,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
