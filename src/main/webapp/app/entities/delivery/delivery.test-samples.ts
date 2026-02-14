import dayjs from 'dayjs/esm';

import { IDelivery, NewDelivery } from './delivery.model';

export const sampleWithRequiredData: IDelivery = {
  id: 30085,
  deliveryDate: dayjs('2026-02-13'),
  status: 'CANCELLED',
};

export const sampleWithPartialData: IDelivery = {
  id: 14818,
  deliveryDate: dayjs('2026-02-14'),
  status: 'PENDING',
  totalAmount: 20261.4,
};

export const sampleWithFullData: IDelivery = {
  id: 6503,
  deliveryDate: dayjs('2026-02-14'),
  status: 'PENDING',
  totalAmount: 3271.93,
  paidAmount: 6074.78,
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewDelivery = {
  deliveryDate: dayjs('2026-02-14'),
  status: 'IN_PROGRESS',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
