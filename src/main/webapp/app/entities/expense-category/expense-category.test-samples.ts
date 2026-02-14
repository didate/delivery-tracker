import { IExpenseCategory, NewExpenseCategory } from './expense-category.model';

export const sampleWithRequiredData: IExpenseCategory = {
  id: 22122,
  code: 'main-d’œuvre',
  name: 'novice',
  active: false,
};

export const sampleWithPartialData: IExpenseCategory = {
  id: 27403,
  code: 'contre au moyen de',
  name: 'juriste oups main-d’œuvre',
  active: true,
};

export const sampleWithFullData: IExpenseCategory = {
  id: 3552,
  code: 'police biathlète',
  name: 'percer sédentaire égoïste',
  description: '../fake-data/blob/hipster.txt',
  active: true,
};

export const sampleWithNewData: NewExpenseCategory = {
  code: 'secouriste',
  name: 'après lentement de la part de',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
