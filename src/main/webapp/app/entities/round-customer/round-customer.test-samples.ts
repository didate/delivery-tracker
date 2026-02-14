import dayjs from 'dayjs/esm';

import { IRoundCustomer, NewRoundCustomer } from './round-customer.model';

export const sampleWithRequiredData: IRoundCustomer = {
  id: 3959,
  sequenceOrder: 5903,
};

export const sampleWithPartialData: IRoundCustomer = {
  id: 25207,
  sequenceOrder: 28946,
  visitTime: dayjs('2026-02-14T04:32'),
};

export const sampleWithFullData: IRoundCustomer = {
  id: 13371,
  sequenceOrder: 17363,
  visited: false,
  visitTime: dayjs('2026-02-13T21:54'),
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewRoundCustomer = {
  sequenceOrder: 17339,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
