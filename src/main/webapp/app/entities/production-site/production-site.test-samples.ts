import { IProductionSite, NewProductionSite } from './production-site.model';

export const sampleWithRequiredData: IProductionSite = {
  id: 4212,
  code: "sitôt vite d'après",
  name: 'hé en face de',
  active: false,
};

export const sampleWithPartialData: IProductionSite = {
  id: 561,
  code: 'blême loufoque fidèl',
  name: 'auprès de admirablement améliorer',
  address: '../fake-data/blob/hipster.txt',
  phone: '+33 696622656',
  active: false,
};

export const sampleWithFullData: IProductionSite = {
  id: 18673,
  code: 'fade pourvu que',
  name: 'population du Québec commissionnaire recueillir',
  address: '../fake-data/blob/hipster.txt',
  phone: '0322729911',
  active: false,
};

export const sampleWithNewData: NewProductionSite = {
  code: 'sauf',
  name: 'sauvage',
  active: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
