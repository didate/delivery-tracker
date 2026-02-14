import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../production-site.test-samples';

import { ProductionSiteFormService } from './production-site-form.service';

describe('ProductionSite Form Service', () => {
  let service: ProductionSiteFormService;

  beforeEach(() => {
    service = TestBed.inject(ProductionSiteFormService);
  });

  describe('Service methods', () => {
    describe('createProductionSiteFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createProductionSiteFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            name: expect.any(Object),
            address: expect.any(Object),
            phone: expect.any(Object),
            active: expect.any(Object),
            tenant: expect.any(Object),
          }),
        );
      });

      it('passing IProductionSite should create a new form with FormGroup', () => {
        const formGroup = service.createProductionSiteFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            name: expect.any(Object),
            address: expect.any(Object),
            phone: expect.any(Object),
            active: expect.any(Object),
            tenant: expect.any(Object),
          }),
        );
      });
    });

    describe('getProductionSite', () => {
      it('should return NewProductionSite for default ProductionSite initial value', () => {
        const formGroup = service.createProductionSiteFormGroup(sampleWithNewData);

        const productionSite = service.getProductionSite(formGroup);

        expect(productionSite).toMatchObject(sampleWithNewData);
      });

      it('should return NewProductionSite for empty ProductionSite initial value', () => {
        const formGroup = service.createProductionSiteFormGroup();

        const productionSite = service.getProductionSite(formGroup);

        expect(productionSite).toMatchObject({});
      });

      it('should return IProductionSite', () => {
        const formGroup = service.createProductionSiteFormGroup(sampleWithRequiredData);

        const productionSite = service.getProductionSite(formGroup);

        expect(productionSite).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IProductionSite should not enable id FormControl', () => {
        const formGroup = service.createProductionSiteFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewProductionSite should disable id FormControl', () => {
        const formGroup = service.createProductionSiteFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
