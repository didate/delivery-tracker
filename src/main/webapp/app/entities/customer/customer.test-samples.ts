import { ICustomer, NewCustomer } from './customer.model';

export const sampleWithRequiredData: ICustomer = {
  id: 3366,
  code: 'résulter sortir',
  name: 'habile ah',
  active: true,
};

export const sampleWithPartialData: ICustomer = {
  id: 31728,
  code: 'entamer via lunatique',
  name: 'cot cot circulaire vouh',
  longitude: 20648.73,
  active: true,
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithFullData: ICustomer = {
  id: 4149,
  code: 'aussitôt que insipide',
  name: 'lors',
  phone: '0732102812',
  email: 'Constance.Francois@hotmail.fr',
  address: '../fake-data/blob/hipster.txt',
  latitude: 2075.41,
  longitude: 6907.59,
  active: false,
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewCustomer = {
  code: 'population du Québec du fait que',
  name: 'débile',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
