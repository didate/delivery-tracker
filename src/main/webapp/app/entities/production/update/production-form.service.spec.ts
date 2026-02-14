import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../production.test-samples';

import { ProductionFormService } from './production-form.service';

describe('Production Form Service', () => {
  let service: ProductionFormService;

  beforeEach(() => {
    service = TestBed.inject(ProductionFormService);
  });

  describe('Service methods', () => {
    describe('createProductionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createProductionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            productionDate: expect.any(Object),
            quantity: expect.any(Object),
            notes: expect.any(Object),
            tenant: expect.any(Object),
            product: expect.any(Object),
            productionSite: expect.any(Object),
          }),
        );
      });

      it('passing IProduction should create a new form with FormGroup', () => {
        const formGroup = service.createProductionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            productionDate: expect.any(Object),
            quantity: expect.any(Object),
            notes: expect.any(Object),
            tenant: expect.any(Object),
            product: expect.any(Object),
            productionSite: expect.any(Object),
          }),
        );
      });
    });

    describe('getProduction', () => {
      it('should return NewProduction for default Production initial value', () => {
        const formGroup = service.createProductionFormGroup(sampleWithNewData);

        const production = service.getProduction(formGroup);

        expect(production).toMatchObject(sampleWithNewData);
      });

      it('should return NewProduction for empty Production initial value', () => {
        const formGroup = service.createProductionFormGroup();

        const production = service.getProduction(formGroup);

        expect(production).toMatchObject({});
      });

      it('should return IProduction', () => {
        const formGroup = service.createProductionFormGroup(sampleWithRequiredData);

        const production = service.getProduction(formGroup);

        expect(production).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IProduction should not enable id FormControl', () => {
        const formGroup = service.createProductionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewProduction should disable id FormControl', () => {
        const formGroup = service.createProductionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
