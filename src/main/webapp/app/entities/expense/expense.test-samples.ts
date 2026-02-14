import dayjs from 'dayjs/esm';

import { IExpense, NewExpense } from './expense.model';

export const sampleWithRequiredData: IExpense = {
  id: 5007,
  expenseDate: dayjs('2026-02-14'),
  amount: 27065.18,
};

export const sampleWithPartialData: IExpense = {
  id: 22347,
  expenseDate: dayjs('2026-02-14'),
  amount: 27976.73,
};

export const sampleWithFullData: IExpense = {
  id: 30901,
  expenseDate: dayjs('2026-02-14'),
  amount: 3779.04,
  description: '../fake-data/blob/hipster.txt',
  receiptUrl: 'deçà',
};

export const sampleWithNewData: NewExpense = {
  expenseDate: dayjs('2026-02-14'),
  amount: 21274.13,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
