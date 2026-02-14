import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../round-customer.test-samples';

import { RoundCustomerFormService } from './round-customer-form.service';

describe('RoundCustomer Form Service', () => {
  let service: RoundCustomerFormService;

  beforeEach(() => {
    service = TestBed.inject(RoundCustomerFormService);
  });

  describe('Service methods', () => {
    describe('createRoundCustomerFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createRoundCustomerFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            sequenceOrder: expect.any(Object),
            visited: expect.any(Object),
            visitTime: expect.any(Object),
            notes: expect.any(Object),
            round: expect.any(Object),
            customer: expect.any(Object),
          }),
        );
      });

      it('passing IRoundCustomer should create a new form with FormGroup', () => {
        const formGroup = service.createRoundCustomerFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            sequenceOrder: expect.any(Object),
            visited: expect.any(Object),
            visitTime: expect.any(Object),
            notes: expect.any(Object),
            round: expect.any(Object),
            customer: expect.any(Object),
          }),
        );
      });
    });

    describe('getRoundCustomer', () => {
      it('should return NewRoundCustomer for default RoundCustomer initial value', () => {
        const formGroup = service.createRoundCustomerFormGroup(sampleWithNewData);

        const roundCustomer = service.getRoundCustomer(formGroup);

        expect(roundCustomer).toMatchObject(sampleWithNewData);
      });

      it('should return NewRoundCustomer for empty RoundCustomer initial value', () => {
        const formGroup = service.createRoundCustomerFormGroup();

        const roundCustomer = service.getRoundCustomer(formGroup);

        expect(roundCustomer).toMatchObject({});
      });

      it('should return IRoundCustomer', () => {
        const formGroup = service.createRoundCustomerFormGroup(sampleWithRequiredData);

        const roundCustomer = service.getRoundCustomer(formGroup);

        expect(roundCustomer).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IRoundCustomer should not enable id FormControl', () => {
        const formGroup = service.createRoundCustomerFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewRoundCustomer should disable id FormControl', () => {
        const formGroup = service.createRoundCustomerFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
