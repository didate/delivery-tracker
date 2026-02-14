import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../return-item.test-samples';

import { ReturnItemFormService } from './return-item-form.service';

describe('ReturnItem Form Service', () => {
  let service: ReturnItemFormService;

  beforeEach(() => {
    service = TestBed.inject(ReturnItemFormService);
  });

  describe('Service methods', () => {
    describe('createReturnItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createReturnItemFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            quantity: expect.any(Object),
            unitPrice: expect.any(Object),
            productReturn: expect.any(Object),
            product: expect.any(Object),
          }),
        );
      });

      it('passing IReturnItem should create a new form with FormGroup', () => {
        const formGroup = service.createReturnItemFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            quantity: expect.any(Object),
            unitPrice: expect.any(Object),
            productReturn: expect.any(Object),
            product: expect.any(Object),
          }),
        );
      });
    });

    describe('getReturnItem', () => {
      it('should return NewReturnItem for default ReturnItem initial value', () => {
        const formGroup = service.createReturnItemFormGroup(sampleWithNewData);

        const returnItem = service.getReturnItem(formGroup);

        expect(returnItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewReturnItem for empty ReturnItem initial value', () => {
        const formGroup = service.createReturnItemFormGroup();

        const returnItem = service.getReturnItem(formGroup);

        expect(returnItem).toMatchObject({});
      });

      it('should return IReturnItem', () => {
        const formGroup = service.createReturnItemFormGroup(sampleWithRequiredData);

        const returnItem = service.getReturnItem(formGroup);

        expect(returnItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IReturnItem should not enable id FormControl', () => {
        const formGroup = service.createReturnItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewReturnItem should disable id FormControl', () => {
        const formGroup = service.createReturnItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
