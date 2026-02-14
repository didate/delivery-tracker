import { IProduct, NewProduct } from './product.model';

export const sampleWithRequiredData: IProduct = {
  id: 11737,
  code: 'drelin au-dessous',
  name: 'oh alors que',
  price: 16146.92,
  active: true,
};

export const sampleWithPartialData: IProduct = {
  id: 14859,
  code: 'turquoise influencer',
  name: 'prestataire de services bzzz ainsi',
  price: 17779.79,
  active: false,
};

export const sampleWithFullData: IProduct = {
  id: 4403,
  code: 'actionnaire',
  name: 'depuis en',
  description: '../fake-data/blob/hipster.txt',
  price: 12917.62,
  active: true,
};

export const sampleWithNewData: NewProduct = {
  code: 'hormis fréquenter ta',
  name: 'envers magnifique hors',
  price: 7532.66,
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
