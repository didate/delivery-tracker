import { IDriver, NewDriver } from './driver.model';

export const sampleWithRequiredData: IDriver = {
  id: 24659,
  code: 'complètement aux env',
  name: 'coin-coin entre-temps',
  active: true,
};

export const sampleWithPartialData: IDriver = {
  id: 29829,
  code: 'entre',
  name: 'bien que efficace',
  phone: '+33 450371480',
  email: 'Virginie.Legall25@yahoo.fr',
  active: true,
};

export const sampleWithFullData: IDriver = {
  id: 28897,
  code: 'clac croâ',
  name: 'tic-tac',
  phone: '0324906155',
  email: 'Cyrille47@hotmail.fr',
  licenseNumber: 'cuicui grrr',
  active: false,
};

export const sampleWithNewData: NewDriver = {
  code: 'hier trop peu',
  name: "à l'insu de",
  active: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
