import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../tenant-settings.test-samples';

import { TenantSettingsFormService } from './tenant-settings-form.service';

describe('TenantSettings Form Service', () => {
  let service: TenantSettingsFormService;

  beforeEach(() => {
    service = TestBed.inject(TenantSettingsFormService);
  });

  describe('Service methods', () => {
    describe('createTenantSettingsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTenantSettingsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            currency: expect.any(Object),
            timezone: expect.any(Object),
            dateFormat: expect.any(Object),
            language: expect.any(Object),
            tenant: expect.any(Object),
          }),
        );
      });

      it('passing ITenantSettings should create a new form with FormGroup', () => {
        const formGroup = service.createTenantSettingsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            currency: expect.any(Object),
            timezone: expect.any(Object),
            dateFormat: expect.any(Object),
            language: expect.any(Object),
            tenant: expect.any(Object),
          }),
        );
      });
    });

    describe('getTenantSettings', () => {
      it('should return NewTenantSettings for default TenantSettings initial value', () => {
        const formGroup = service.createTenantSettingsFormGroup(sampleWithNewData);

        const tenantSettings = service.getTenantSettings(formGroup);

        expect(tenantSettings).toMatchObject(sampleWithNewData);
      });

      it('should return NewTenantSettings for empty TenantSettings initial value', () => {
        const formGroup = service.createTenantSettingsFormGroup();

        const tenantSettings = service.getTenantSettings(formGroup);

        expect(tenantSettings).toMatchObject({});
      });

      it('should return ITenantSettings', () => {
        const formGroup = service.createTenantSettingsFormGroup(sampleWithRequiredData);

        const tenantSettings = service.getTenantSettings(formGroup);

        expect(tenantSettings).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITenantSettings should not enable id FormControl', () => {
        const formGroup = service.createTenantSettingsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTenantSettings should disable id FormControl', () => {
        const formGroup = service.createTenantSettingsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
