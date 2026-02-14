import dayjs from 'dayjs/esm';

import { IPayment, NewPayment } from './payment.model';

export const sampleWithRequiredData: IPayment = {
  id: 4942,
  paymentDate: dayjs('2026-02-14'),
  amount: 13212.06,
  method: 'CASH',
};

export const sampleWithPartialData: IPayment = {
  id: 26735,
  paymentDate: dayjs('2026-02-14'),
  amount: 11071.62,
  method: 'MOBILE_PAYMENT',
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithFullData: IPayment = {
  id: 28239,
  paymentDate: dayjs('2026-02-14'),
  amount: 14590.51,
  method: 'BANK_TRANSFER',
  reference: 'recommencer jusqu’à ce que personnel',
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewPayment = {
  paymentDate: dayjs('2026-02-13'),
  amount: 3833.56,
  method: 'CASH',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
