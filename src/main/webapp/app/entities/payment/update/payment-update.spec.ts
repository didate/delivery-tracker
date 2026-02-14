import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICustomer } from 'app/entities/customer/customer.model';
import { CustomerService } from 'app/entities/customer/service/customer.service';
import { IDelivery } from 'app/entities/delivery/delivery.model';
import { DeliveryService } from 'app/entities/delivery/service/delivery.service';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { IPayment } from '../payment.model';
import { PaymentService } from '../service/payment.service';

import { PaymentFormService } from './payment-form.service';
import { PaymentUpdate } from './payment-update';

describe('Payment Management Update Component', () => {
  let comp: PaymentUpdate;
  let fixture: ComponentFixture<PaymentUpdate>;
  let activatedRoute: ActivatedRoute;
  let paymentFormService: PaymentFormService;
  let paymentService: PaymentService;
  let tenantService: TenantService;
  let customerService: CustomerService;
  let deliveryService: DeliveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PaymentUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    paymentFormService = TestBed.inject(PaymentFormService);
    paymentService = TestBed.inject(PaymentService);
    tenantService = TestBed.inject(TenantService);
    customerService = TestBed.inject(CustomerService);
    deliveryService = TestBed.inject(DeliveryService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Tenant query and add missing value', () => {
      const payment: IPayment = { id: 31232 };
      const tenant: ITenant = { id: 2662 };
      payment.tenant = tenant;

      const tenantCollection: ITenant[] = [{ id: 2662 }];
      vitest.spyOn(tenantService, 'query').mockReturnValue(of(new HttpResponse({ body: tenantCollection })));
      const additionalTenants = [tenant];
      const expectedCollection: ITenant[] = [...additionalTenants, ...tenantCollection];
      vitest.spyOn(tenantService, 'addTenantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      expect(tenantService.query).toHaveBeenCalled();
      expect(tenantService.addTenantToCollectionIfMissing).toHaveBeenCalledWith(
        tenantCollection,
        ...additionalTenants.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.tenantsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Customer query and add missing value', () => {
      const payment: IPayment = { id: 31232 };
      const customer: ICustomer = { id: 26915 };
      payment.customer = customer;

      const customerCollection: ICustomer[] = [{ id: 26915 }];
      vitest.spyOn(customerService, 'query').mockReturnValue(of(new HttpResponse({ body: customerCollection })));
      const additionalCustomers = [customer];
      const expectedCollection: ICustomer[] = [...additionalCustomers, ...customerCollection];
      vitest.spyOn(customerService, 'addCustomerToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      expect(customerService.query).toHaveBeenCalled();
      expect(customerService.addCustomerToCollectionIfMissing).toHaveBeenCalledWith(
        customerCollection,
        ...additionalCustomers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.customersSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Delivery query and add missing value', () => {
      const payment: IPayment = { id: 31232 };
      const delivery: IDelivery = { id: 16325 };
      payment.delivery = delivery;

      const deliveryCollection: IDelivery[] = [{ id: 16325 }];
      vitest.spyOn(deliveryService, 'query').mockReturnValue(of(new HttpResponse({ body: deliveryCollection })));
      const additionalDeliveries = [delivery];
      const expectedCollection: IDelivery[] = [...additionalDeliveries, ...deliveryCollection];
      vitest.spyOn(deliveryService, 'addDeliveryToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      expect(deliveryService.query).toHaveBeenCalled();
      expect(deliveryService.addDeliveryToCollectionIfMissing).toHaveBeenCalledWith(
        deliveryCollection,
        ...additionalDeliveries.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.deliveriesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const payment: IPayment = { id: 31232 };
      const tenant: ITenant = { id: 2662 };
      payment.tenant = tenant;
      const customer: ICustomer = { id: 26915 };
      payment.customer = customer;
      const delivery: IDelivery = { id: 16325 };
      payment.delivery = delivery;

      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      expect(comp.tenantsSharedCollection()).toContainEqual(tenant);
      expect(comp.customersSharedCollection()).toContainEqual(customer);
      expect(comp.deliveriesSharedCollection()).toContainEqual(delivery);
      expect(comp.payment).toEqual(payment);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayment>>();
      const payment = { id: 20208 };
      vitest.spyOn(paymentFormService, 'getPayment').mockReturnValue(payment);
      vitest.spyOn(paymentService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: payment }));
      saveSubject.complete();

      // THEN
      expect(paymentFormService.getPayment).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(paymentService.update).toHaveBeenCalledWith(expect.objectContaining(payment));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayment>>();
      const payment = { id: 20208 };
      vitest.spyOn(paymentFormService, 'getPayment').mockReturnValue({ id: null });
      vitest.spyOn(paymentService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payment: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: payment }));
      saveSubject.complete();

      // THEN
      expect(paymentFormService.getPayment).toHaveBeenCalled();
      expect(paymentService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayment>>();
      const payment = { id: 20208 };
      vitest.spyOn(paymentService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payment });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(paymentService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTenant', () => {
      it('should forward to tenantService', () => {
        const entity = { id: 2662 };
        const entity2 = { id: 17495 };
        vitest.spyOn(tenantService, 'compareTenant');
        comp.compareTenant(entity, entity2);
        expect(tenantService.compareTenant).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareCustomer', () => {
      it('should forward to customerService', () => {
        const entity = { id: 26915 };
        const entity2 = { id: 21032 };
        vitest.spyOn(customerService, 'compareCustomer');
        comp.compareCustomer(entity, entity2);
        expect(customerService.compareCustomer).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareDelivery', () => {
      it('should forward to deliveryService', () => {
        const entity = { id: 16325 };
        const entity2 = { id: 9797 };
        vitest.spyOn(deliveryService, 'compareDelivery');
        comp.compareDelivery(entity, entity2);
        expect(deliveryService.compareDelivery).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
