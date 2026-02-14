import dayjs from 'dayjs/esm';

import { IProductReturn, NewProductReturn } from './product-return.model';

export const sampleWithRequiredData: IProductReturn = {
  id: 9947,
  returnDate: dayjs('2026-02-14'),
  reason: 'OTHER',
};

export const sampleWithPartialData: IProductReturn = {
  id: 3101,
  returnDate: dayjs('2026-02-14'),
  reason: 'WRONG_PRODUCT',
};

export const sampleWithFullData: IProductReturn = {
  id: 1277,
  returnDate: dayjs('2026-02-14'),
  reason: 'DAMAGED',
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewProductReturn = {
  returnDate: dayjs('2026-02-14'),
  reason: 'CUSTOMER_REFUSAL',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
