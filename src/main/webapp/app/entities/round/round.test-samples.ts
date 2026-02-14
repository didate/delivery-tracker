import dayjs from 'dayjs/esm';

import { IRound, NewRound } from './round.model';

export const sampleWithRequiredData: IRound = {
  id: 21726,
  name: 'cadre',
  roundDate: dayjs('2026-02-13'),
  status: 'PLANNED',
};

export const sampleWithPartialData: IRound = {
  id: 29671,
  name: 'aussi via diététiste',
  roundDate: dayjs('2026-02-13'),
  status: 'CANCELLED',
  endTime: dayjs('2026-02-13T17:19'),
};

export const sampleWithFullData: IRound = {
  id: 32041,
  name: 'simplifier',
  roundDate: dayjs('2026-02-14'),
  status: 'COMPLETED',
  startTime: dayjs('2026-02-14T14:09'),
  endTime: dayjs('2026-02-14T01:51'),
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewRound = {
  name: 'miam',
  roundDate: dayjs('2026-02-14'),
  status: 'IN_PROGRESS',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
