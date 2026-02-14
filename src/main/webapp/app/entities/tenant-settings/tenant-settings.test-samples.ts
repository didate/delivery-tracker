import { ITenantSettings, NewTenantSettings } from './tenant-settings.model';

export const sampleWithRequiredData: ITenantSettings = {
  id: 28508,
};

export const sampleWithPartialData: ITenantSettings = {
  id: 19116,
  currency: 'plu',
  dateFormat: 'miam',
  language: 'au dépens ',
};

export const sampleWithFullData: ITenantSettings = {
  id: 30034,
  currency: 'tri',
  timezone: 'broum environ paf',
  dateFormat: 'du fait que tuer',
  language: 'conclure s',
};

export const sampleWithNewData: NewTenantSettings = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
