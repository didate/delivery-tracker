import { ITenant, NewTenant } from './tenant.model';

export const sampleWithRequiredData: ITenant = {
  id: 32514,
  code: 'puisque peu juriste',
  name: 'commissionnaire vorace',
  email: 'Cesaire.Moulin18@gmail.com',
  active: true,
};

export const sampleWithPartialData: ITenant = {
  id: 21164,
  code: 'à seule fin de pardo',
  name: 'au cas où multiple y',
  email: 'Cyrille_Fournier90@hotmail.fr',
  address: '../fake-data/blob/hipster.txt',
  logoUrl: 'blablabla',
  active: false,
};

export const sampleWithFullData: ITenant = {
  id: 4480,
  code: 'toc',
  name: 'au défaut de',
  email: 'Ambre.Dumas18@gmail.com',
  phone: '+33 578390703',
  address: '../fake-data/blob/hipster.txt',
  logoUrl: 'membre à vie jaillir',
  active: true,
};

export const sampleWithNewData: NewTenant = {
  code: 'toc-toc',
  name: 'rédaction charger bof',
  email: 'Eugenie.Moreau83@gmail.com',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
