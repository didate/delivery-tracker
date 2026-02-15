import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IDriver } from 'app/entities/driver/driver.model';
import { DriverService } from 'app/entities/driver/service/driver.service';
import { ICustomer } from '../customer.model';
import { CustomerService } from '../service/customer.service';

import { CustomerFormService } from './customer-form.service';
import { CustomerUpdate } from './customer-update';

describe('Customer Management Update Component', () => {
  let comp: CustomerUpdate;
  let fixture: ComponentFixture<CustomerUpdate>;
  let activatedRoute: ActivatedRoute;
  let customerFormService: CustomerFormService;
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

    fixture = TestBed.createComponent(CustomerUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    customerFormService = TestBed.inject(CustomerFormService);
    customerService = TestBed.inject(CustomerService);
    driverService = TestBed.inject(DriverService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Driver query and add missing value', () => {
      const customer: ICustomer = { id: 21032 };
      const driver: IDriver = { id: 27475 };
      customer.driver = driver;

      const driverCollection: IDriver[] = [{ id: 27475 }];
      vitest.spyOn(driverService, 'query').mockReturnValue(of(new HttpResponse({ body: driverCollection })));
      const additionalDrivers = [driver];
      const expectedCollection: IDriver[] = [...additionalDrivers, ...driverCollection];
      vitest.spyOn(driverService, 'addDriverToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ customer });
      comp.ngOnInit();

      expect(driverService.query).toHaveBeenCalled();
      expect(driverService.addDriverToCollectionIfMissing).toHaveBeenCalledWith(
        driverCollection,
        ...additionalDrivers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.driversSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const customer: ICustomer = { id: 21032 };
      const driver: IDriver = { id: 27475 };
      customer.driver = driver;

      activatedRoute.data = of({ customer });
      comp.ngOnInit();

      expect(comp.driversSharedCollection()).toContainEqual(driver);
      expect(comp.customer).toEqual(customer);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICustomer>>();
      const customer = { id: 26915 };
      vitest.spyOn(customerFormService, 'getCustomer').mockReturnValue(customer);
      vitest.spyOn(customerService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: customer }));
      saveSubject.complete();

      // THEN
      expect(customerFormService.getCustomer).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(customerService.update).toHaveBeenCalledWith(expect.objectContaining(customer));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICustomer>>();
      const customer = { id: 26915 };
      vitest.spyOn(customerFormService, 'getCustomer').mockReturnValue({ id: null });
      vitest.spyOn(customerService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customer: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: customer }));
      saveSubject.complete();

      // THEN
      expect(customerFormService.getCustomer).toHaveBeenCalled();
      expect(customerService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICustomer>>();
      const customer = { id: 26915 };
      vitest.spyOn(customerService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ customer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(customerService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
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
