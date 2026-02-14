import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../delivery.test-samples';

import { DeliveryFormService } from './delivery-form.service';

describe('Delivery Form Service', () => {
  let service: DeliveryFormService;

  beforeEach(() => {
    service = TestBed.inject(DeliveryFormService);
  });

  describe('Service methods', () => {
    describe('createDeliveryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDeliveryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            deliveryDate: expect.any(Object),
            status: expect.any(Object),
            totalAmount: expect.any(Object),
            paidAmount: expect.any(Object),
            notes: expect.any(Object),
            tenant: expect.any(Object),
            customer: expect.any(Object),
            driver: expect.any(Object),
          }),
        );
      });

      it('passing IDelivery should create a new form with FormGroup', () => {
        const formGroup = service.createDeliveryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            deliveryDate: expect.any(Object),
            status: expect.any(Object),
            totalAmount: expect.any(Object),
            paidAmount: expect.any(Object),
            notes: expect.any(Object),
            tenant: expect.any(Object),
            customer: expect.any(Object),
            driver: expect.any(Object),
          }),
        );
      });
    });

    describe('getDelivery', () => {
      it('should return NewDelivery for default Delivery initial value', () => {
        const formGroup = service.createDeliveryFormGroup(sampleWithNewData);

        const delivery = service.getDelivery(formGroup);

        expect(delivery).toMatchObject(sampleWithNewData);
      });

      it('should return NewDelivery for empty Delivery initial value', () => {
        const formGroup = service.createDeliveryFormGroup();

        const delivery = service.getDelivery(formGroup);

        expect(delivery).toMatchObject({});
      });

      it('should return IDelivery', () => {
        const formGroup = service.createDeliveryFormGroup(sampleWithRequiredData);

        const delivery = service.getDelivery(formGroup);

        expect(delivery).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDelivery should not enable id FormControl', () => {
        const formGroup = service.createDeliveryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDelivery should disable id FormControl', () => {
        const formGroup = service.createDeliveryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
