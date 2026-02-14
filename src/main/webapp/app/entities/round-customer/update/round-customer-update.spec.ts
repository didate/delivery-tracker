import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICustomer } from 'app/entities/customer/customer.model';
import { CustomerService } from 'app/entities/customer/service/customer.service';
import { IRound } from 'app/entities/round/round.model';
import { RoundService } from 'app/entities/round/service/round.service';
import { IRoundCustomer } from '../round-customer.model';
import { RoundCustomerService } from '../service/round-customer.service';

import { RoundCustomerFormService } from './round-customer-form.service';
import { RoundCustomerUpdate } from './round-customer-update';

describe('RoundCustomer Management Update Component', () => {
  let comp: RoundCustomerUpdate;
  let fixture: ComponentFixture<RoundCustomerUpdate>;
  let activatedRoute: ActivatedRoute;
  let roundCustomerFormService: RoundCustomerFormService;
  let roundCustomerService: RoundCustomerService;
  let roundService: RoundService;
  let customerService: CustomerService;

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

    fixture = TestBed.createComponent(RoundCustomerUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    roundCustomerFormService = TestBed.inject(RoundCustomerFormService);
    roundCustomerService = TestBed.inject(RoundCustomerService);
    roundService = TestBed.inject(RoundService);
    customerService = TestBed.inject(CustomerService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Round query and add missing value', () => {
      const roundCustomer: IRoundCustomer = { id: 21862 };
      const round: IRound = { id: 19799 };
      roundCustomer.round = round;

      const roundCollection: IRound[] = [{ id: 19799 }];
      vitest.spyOn(roundService, 'query').mockReturnValue(of(new HttpResponse({ body: roundCollection })));
      const additionalRounds = [round];
      const expectedCollection: IRound[] = [...additionalRounds, ...roundCollection];
      vitest.spyOn(roundService, 'addRoundToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ roundCustomer });
      comp.ngOnInit();

      expect(roundService.query).toHaveBeenCalled();
      expect(roundService.addRoundToCollectionIfMissing).toHaveBeenCalledWith(
        roundCollection,
        ...additionalRounds.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.roundsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Customer query and add missing value', () => {
      const roundCustomer: IRoundCustomer = { id: 21862 };
      const customer: ICustomer = { id: 26915 };
      roundCustomer.customer = customer;

      const customerCollection: ICustomer[] = [{ id: 26915 }];
      vitest.spyOn(customerService, 'query').mockReturnValue(of(new HttpResponse({ body: customerCollection })));
      const additionalCustomers = [customer];
      const expectedCollection: ICustomer[] = [...additionalCustomers, ...customerCollection];
      vitest.spyOn(customerService, 'addCustomerToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ roundCustomer });
      comp.ngOnInit();

      expect(customerService.query).toHaveBeenCalled();
      expect(customerService.addCustomerToCollectionIfMissing).toHaveBeenCalledWith(
        customerCollection,
        ...additionalCustomers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.customersSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const roundCustomer: IRoundCustomer = { id: 21862 };
      const round: IRound = { id: 19799 };
      roundCustomer.round = round;
      const customer: ICustomer = { id: 26915 };
      roundCustomer.customer = customer;

      activatedRoute.data = of({ roundCustomer });
      comp.ngOnInit();

      expect(comp.roundsSharedCollection()).toContainEqual(round);
      expect(comp.customersSharedCollection()).toContainEqual(customer);
      expect(comp.roundCustomer).toEqual(roundCustomer);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRoundCustomer>>();
      const roundCustomer = { id: 5340 };
      vitest.spyOn(roundCustomerFormService, 'getRoundCustomer').mockReturnValue(roundCustomer);
      vitest.spyOn(roundCustomerService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ roundCustomer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: roundCustomer }));
      saveSubject.complete();

      // THEN
      expect(roundCustomerFormService.getRoundCustomer).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(roundCustomerService.update).toHaveBeenCalledWith(expect.objectContaining(roundCustomer));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRoundCustomer>>();
      const roundCustomer = { id: 5340 };
      vitest.spyOn(roundCustomerFormService, 'getRoundCustomer').mockReturnValue({ id: null });
      vitest.spyOn(roundCustomerService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ roundCustomer: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: roundCustomer }));
      saveSubject.complete();

      // THEN
      expect(roundCustomerFormService.getRoundCustomer).toHaveBeenCalled();
      expect(roundCustomerService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRoundCustomer>>();
      const roundCustomer = { id: 5340 };
      vitest.spyOn(roundCustomerService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ roundCustomer });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(roundCustomerService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareRound', () => {
      it('should forward to roundService', () => {
        const entity = { id: 19799 };
        const entity2 = { id: 13350 };
        vitest.spyOn(roundService, 'compareRound');
        comp.compareRound(entity, entity2);
        expect(roundService.compareRound).toHaveBeenCalledWith(entity, entity2);
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
  });
});
