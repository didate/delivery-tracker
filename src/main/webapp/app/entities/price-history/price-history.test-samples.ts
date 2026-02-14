import dayjs from 'dayjs/esm';

import { IPriceHistory, NewPriceHistory } from './price-history.model';

export const sampleWithRequiredData: IPriceHistory = {
  id: 14023,
  price: 2379.7,
  effectiveDate: dayjs('2026-02-14'),
};

export const sampleWithPartialData: IPriceHistory = {
  id: 16711,
  price: 2002.85,
  effectiveDate: dayjs('2026-02-14'),
};

export const sampleWithFullData: IPriceHistory = {
  id: 2654,
  price: 16324.48,
  effectiveDate: dayjs('2026-02-13'),
};

export const sampleWithNewData: NewPriceHistory = {
  price: 29269.86,
  effectiveDate: dayjs('2026-02-13'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
