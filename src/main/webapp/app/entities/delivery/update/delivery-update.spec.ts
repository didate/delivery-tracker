import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICustomer } from 'app/entities/customer/customer.model';
import { CustomerService } from 'app/entities/customer/service/customer.service';
import { IDriver } from 'app/entities/driver/driver.model';
import { DriverService } from 'app/entities/driver/service/driver.service';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { IDelivery } from '../delivery.model';
import { DeliveryService } from '../service/delivery.service';

import { DeliveryFormService } from './delivery-form.service';
import { DeliveryUpdate } from './delivery-update';

describe('Delivery Management Update Component', () => {
  let comp: DeliveryUpdate;
  let fixture: ComponentFixture<DeliveryUpdate>;
  let activatedRoute: ActivatedRoute;
  let deliveryFormService: DeliveryFormService;
  let deliveryService: DeliveryService;
  let tenantService: TenantService;
  let customerService: CustomerService;
  let driverService: DriverService;

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

    fixture = TestBed.createComponent(DeliveryUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    deliveryFormService = TestBed.inject(DeliveryFormService);
    deliveryService = TestBed.inject(DeliveryService);
    tenantService = TestBed.inject(TenantService);
    customerService = TestBed.inject(CustomerService);
    driverService = TestBed.inject(DriverService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Tenant query and add missing value', () => {
      const delivery: IDelivery = { id: 9797 };
      const tenant: ITenant = { id: 2662 };
      delivery.tenant = tenant;

      const tenantCollection: ITenant[] = [{ id: 2662 }];
      vitest.spyOn(tenantService, 'query').mockReturnValue(of(new HttpResponse({ body: tenantCollection })));
      const additionalTenants = [tenant];
      const expectedCollection: ITenant[] = [...additionalTenants, ...tenantCollection];
      vitest.spyOn(tenantService, 'addTenantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      expect(tenantService.query).toHaveBeenCalled();
      expect(tenantService.addTenantToCollectionIfMissing).toHaveBeenCalledWith(
        tenantCollection,
        ...additionalTenants.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.tenantsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Customer query and add missing value', () => {
      const delivery: IDelivery = { id: 9797 };
      const customer: ICustomer = { id: 26915 };
      delivery.customer = customer;

      const customerCollection: ICustomer[] = [{ id: 26915 }];
      vitest.spyOn(customerService, 'query').mockReturnValue(of(new HttpResponse({ body: customerCollection })));
      const additionalCustomers = [customer];
      const expectedCollection: ICustomer[] = [...additionalCustomers, ...customerCollection];
      vitest.spyOn(customerService, 'addCustomerToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      expect(customerService.query).toHaveBeenCalled();
      expect(customerService.addCustomerToCollectionIfMissing).toHaveBeenCalledWith(
        customerCollection,
        ...additionalCustomers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.customersSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Driver query and add missing value', () => {
      const delivery: IDelivery = { id: 9797 };
      const driver: IDriver = { id: 27475 };
      delivery.driver = driver;

      const driverCollection: IDriver[] = [{ id: 27475 }];
      vitest.spyOn(driverService, 'query').mockReturnValue(of(new HttpResponse({ body: driverCollection })));
      const additionalDrivers = [driver];
      const expectedCollection: IDriver[] = [...additionalDrivers, ...driverCollection];
      vitest.spyOn(driverService, 'addDriverToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      expect(driverService.query).toHaveBeenCalled();
      expect(driverService.addDriverToCollectionIfMissing).toHaveBeenCalledWith(
        driverCollection,
        ...additionalDrivers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.driversSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const delivery: IDelivery = { id: 9797 };
      const tenant: ITenant = { id: 2662 };
      delivery.tenant = tenant;
      const customer: ICustomer = { id: 26915 };
      delivery.customer = customer;
      const driver: IDriver = { id: 27475 };
      delivery.driver = driver;

      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      expect(comp.tenantsSharedCollection()).toContainEqual(tenant);
      expect(comp.customersSharedCollection()).toContainEqual(customer);
      expect(comp.driversSharedCollection()).toContainEqual(driver);
      expect(comp.delivery).toEqual(delivery);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDelivery>>();
      const delivery = { id: 16325 };
      vitest.spyOn(deliveryFormService, 'getDelivery').mockReturnValue(delivery);
      vitest.spyOn(deliveryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: delivery }));
      saveSubject.complete();

      // THEN
      expect(deliveryFormService.getDelivery).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(deliveryService.update).toHaveBeenCalledWith(expect.objectContaining(delivery));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDelivery>>();
      const delivery = { id: 16325 };
      vitest.spyOn(deliveryFormService, 'getDelivery').mockReturnValue({ id: null });
      vitest.spyOn(deliveryService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ delivery: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: delivery }));
      saveSubject.complete();

      // THEN
      expect(deliveryFormService.getDelivery).toHaveBeenCalled();
      expect(deliveryService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDelivery>>();
      const delivery = { id: 16325 };
      vitest.spyOn(deliveryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ delivery });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(deliveryService.update).toHaveBeenCalled();
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

    describe('compareDriver', () => {
      it('should forward to driverService', () => {
        const entity = { id: 27475 };
        const entity2 = { id: 7800 };
        vitest.spyOn(driverService, 'compareDriver');
        comp.compareDriver(entity, entity2);
        expect(driverService.compareDriver).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
