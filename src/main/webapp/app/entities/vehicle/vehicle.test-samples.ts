import { IVehicle, NewVehicle } from './vehicle.model';

export const sampleWithRequiredData: IVehicle = {
  id: 7486,
  code: 'saigner',
  name: 'tant que prestataire de services reprocher',
  type: 'MOTO',
  active: false,
};

export const sampleWithPartialData: IVehicle = {
  id: 11160,
  code: 'chef vroum',
  name: 'adversaire électorat',
  type: 'CAR',
  model: 'sitôt que',
  registrationNumber: 'minuscule',
  active: true,
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithFullData: IVehicle = {
  id: 12947,
  code: 'ouch bè avare',
  name: 'impromptu',
  type: 'MOTO',
  brand: 'en outre de lorsque',
  model: 'ramener au point que',
  registrationNumber: 'affecter verger',
  year: 1796,
  capacity: 15916.01,
  fuelType: 'équipe de recherche',
  active: true,
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewVehicle = {
  code: 'dessus entrer',
  name: 'touchant gestionnaire',
  type: 'TRUCK',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
