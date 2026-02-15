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
import { IProductReturn } from '../product-return.model';
import { ProductReturnService } from '../service/product-return.service';

import { ProductReturnFormService } from './product-return-form.service';
import { ProductReturnUpdate } from './product-return-update';

describe('ProductReturn Management Update Component', () => {
  let comp: ProductReturnUpdate;
  let fixture: ComponentFixture<ProductReturnUpdate>;
  let activatedRoute: ActivatedRoute;
  let productReturnFormService: ProductReturnFormService;
  let productReturnService: ProductReturnService;
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

    fixture = TestBed.createComponent(ProductReturnUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    productReturnFormService = TestBed.inject(ProductReturnFormService);
    productReturnService = TestBed.inject(ProductReturnService);
    customerService = TestBed.inject(CustomerService);
    deliveryService = TestBed.inject(DeliveryService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Customer query and add missing value', () => {
      const productReturn: IProductReturn = { id: 20976 };
      const customer: ICustomer = { id: 26915 };
      productReturn.customer = customer;

      const customerCollection: ICustomer[] = [{ id: 26915 }];
      vitest.spyOn(customerService, 'query').mockReturnValue(of(new HttpResponse({ body: customerCollection })));
      const additionalCustomers = [customer];
      const expectedCollection: ICustomer[] = [...additionalCustomers, ...customerCollection];
      vitest.spyOn(customerService, 'addCustomerToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ productReturn });
      comp.ngOnInit();

      expect(customerService.query).toHaveBeenCalled();
      expect(customerService.addCustomerToCollectionIfMissing).toHaveBeenCalledWith(
        customerCollection,
        ...additionalCustomers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.customersSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Delivery query and add missing value', () => {
      const productReturn: IProductReturn = { id: 20976 };
      const delivery: IDelivery = { id: 16325 };
      productReturn.delivery = delivery;

      const deliveryCollection: IDelivery[] = [{ id: 16325 }];
      vitest.spyOn(deliveryService, 'query').mockReturnValue(of(new HttpResponse({ body: deliveryCollection })));
      const additionalDeliveries = [delivery];
      const expectedCollection: IDelivery[] = [...additionalDeliveries, ...deliveryCollection];
      vitest.spyOn(deliveryService, 'addDeliveryToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ productReturn });
      comp.ngOnInit();

      expect(deliveryService.query).toHaveBeenCalled();
      expect(deliveryService.addDeliveryToCollectionIfMissing).toHaveBeenCalledWith(
        deliveryCollection,
        ...additionalDeliveries.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.deliveriesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const productReturn: IProductReturn = { id: 20976 };
      const customer: ICustomer = { id: 26915 };
      productReturn.customer = customer;
      const delivery: IDelivery = { id: 16325 };
      productReturn.delivery = delivery;

      activatedRoute.data = of({ productReturn });
      comp.ngOnInit();

      expect(comp.customersSharedCollection()).toContainEqual(customer);
      expect(comp.deliveriesSharedCollection()).toContainEqual(delivery);
      expect(comp.productReturn).toEqual(productReturn);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProductReturn>>();
      const productReturn = { id: 8123 };
      vitest.spyOn(productReturnFormService, 'getProductReturn').mockReturnValue(productReturn);
      vitest.spyOn(productReturnService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productReturn });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: productReturn }));
      saveSubject.complete();

      // THEN
      expect(productReturnFormService.getProductReturn).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(productReturnService.update).toHaveBeenCalledWith(expect.objectContaining(productReturn));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProductReturn>>();
      const productReturn = { id: 8123 };
      vitest.spyOn(productReturnFormService, 'getProductReturn').mockReturnValue({ id: null });
      vitest.spyOn(productReturnService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productReturn: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: productReturn }));
      saveSubject.complete();

      // THEN
      expect(productReturnFormService.getProductReturn).toHaveBeenCalled();
      expect(productReturnService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProductReturn>>();
      const productReturn = { id: 8123 };
      vitest.spyOn(productReturnService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productReturn });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(productReturnService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
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
