import dayjs from 'dayjs/esm';

import { IProduction, NewProduction } from './production.model';

export const sampleWithRequiredData: IProduction = {
  id: 26299,
  productionDate: dayjs('2026-02-13'),
  quantity: 28781.06,
};

export const sampleWithPartialData: IProduction = {
  id: 26276,
  productionDate: dayjs('2026-02-14'),
  quantity: 25854.78,
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithFullData: IProduction = {
  id: 32692,
  productionDate: dayjs('2026-02-14'),
  quantity: 18806.14,
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewProduction = {
  productionDate: dayjs('2026-02-13'),
  quantity: 5273.93,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
