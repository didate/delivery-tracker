import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IDriver } from 'app/entities/driver/driver.model';
import { DriverService } from 'app/entities/driver/service/driver.service';
import { IExpenseCategory } from 'app/entities/expense-category/expense-category.model';
import { ExpenseCategoryService } from 'app/entities/expense-category/service/expense-category.service';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { IExpense } from '../expense.model';
import { ExpenseService } from '../service/expense.service';

import { ExpenseFormService } from './expense-form.service';
import { ExpenseUpdate } from './expense-update';

describe('Expense Management Update Component', () => {
  let comp: ExpenseUpdate;
  let fixture: ComponentFixture<ExpenseUpdate>;
  let activatedRoute: ActivatedRoute;
  let expenseFormService: ExpenseFormService;
  let expenseService: ExpenseService;
  let tenantService: TenantService;
  let expenseCategoryService: ExpenseCategoryService;
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

    fixture = TestBed.createComponent(ExpenseUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    expenseFormService = TestBed.inject(ExpenseFormService);
    expenseService = TestBed.inject(ExpenseService);
    tenantService = TestBed.inject(TenantService);
    expenseCategoryService = TestBed.inject(ExpenseCategoryService);
    driverService = TestBed.inject(DriverService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Tenant query and add missing value', () => {
      const expense: IExpense = { id: 9220 };
      const tenant: ITenant = { id: 2662 };
      expense.tenant = tenant;

      const tenantCollection: ITenant[] = [{ id: 2662 }];
      vitest.spyOn(tenantService, 'query').mockReturnValue(of(new HttpResponse({ body: tenantCollection })));
      const additionalTenants = [tenant];
      const expectedCollection: ITenant[] = [...additionalTenants, ...tenantCollection];
      vitest.spyOn(tenantService, 'addTenantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ expense });
      comp.ngOnInit();

      expect(tenantService.query).toHaveBeenCalled();
      expect(tenantService.addTenantToCollectionIfMissing).toHaveBeenCalledWith(
        tenantCollection,
        ...additionalTenants.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.tenantsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call ExpenseCategory query and add missing value', () => {
      const expense: IExpense = { id: 9220 };
      const category: IExpenseCategory = { id: 17564 };
      expense.category = category;

      const expenseCategoryCollection: IExpenseCategory[] = [{ id: 17564 }];
      vitest.spyOn(expenseCategoryService, 'query').mockReturnValue(of(new HttpResponse({ body: expenseCategoryCollection })));
      const additionalExpenseCategories = [category];
      const expectedCollection: IExpenseCategory[] = [...additionalExpenseCategories, ...expenseCategoryCollection];
      vitest.spyOn(expenseCategoryService, 'addExpenseCategoryToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ expense });
      comp.ngOnInit();

      expect(expenseCategoryService.query).toHaveBeenCalled();
      expect(expenseCategoryService.addExpenseCategoryToCollectionIfMissing).toHaveBeenCalledWith(
        expenseCategoryCollection,
        ...additionalExpenseCategories.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.expenseCategoriesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Driver query and add missing value', () => {
      const expense: IExpense = { id: 9220 };
      const driver: IDriver = { id: 27475 };
      expense.driver = driver;

      const driverCollection: IDriver[] = [{ id: 27475 }];
      vitest.spyOn(driverService, 'query').mockReturnValue(of(new HttpResponse({ body: driverCollection })));
      const additionalDrivers = [driver];
      const expectedCollection: IDriver[] = [...additionalDrivers, ...driverCollection];
      vitest.spyOn(driverService, 'addDriverToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ expense });
      comp.ngOnInit();

      expect(driverService.query).toHaveBeenCalled();
      expect(driverService.addDriverToCollectionIfMissing).toHaveBeenCalledWith(
        driverCollection,
        ...additionalDrivers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.driversSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const expense: IExpense = { id: 9220 };
      const tenant: ITenant = { id: 2662 };
      expense.tenant = tenant;
      const category: IExpenseCategory = { id: 17564 };
      expense.category = category;
      const driver: IDriver = { id: 27475 };
      expense.driver = driver;

      activatedRoute.data = of({ expense });
      comp.ngOnInit();

      expect(comp.tenantsSharedCollection()).toContainEqual(tenant);
      expect(comp.expenseCategoriesSharedCollection()).toContainEqual(category);
      expect(comp.driversSharedCollection()).toContainEqual(driver);
      expect(comp.expense).toEqual(expense);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExpense>>();
      const expense = { id: 17742 };
      vitest.spyOn(expenseFormService, 'getExpense').mockReturnValue(expense);
      vitest.spyOn(expenseService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ expense });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: expense }));
      saveSubject.complete();

      // THEN
      expect(expenseFormService.getExpense).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(expenseService.update).toHaveBeenCalledWith(expect.objectContaining(expense));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExpense>>();
      const expense = { id: 17742 };
      vitest.spyOn(expenseFormService, 'getExpense').mockReturnValue({ id: null });
      vitest.spyOn(expenseService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ expense: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: expense }));
      saveSubject.complete();

      // THEN
      expect(expenseFormService.getExpense).toHaveBeenCalled();
      expect(expenseService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExpense>>();
      const expense = { id: 17742 };
      vitest.spyOn(expenseService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ expense });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(expenseService.update).toHaveBeenCalled();
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

    describe('compareExpenseCategory', () => {
      it('should forward to expenseCategoryService', () => {
        const entity = { id: 17564 };
        const entity2 = { id: 28308 };
        vitest.spyOn(expenseCategoryService, 'compareExpenseCategory');
        comp.compareExpenseCategory(entity, entity2);
        expect(expenseCategoryService.compareExpenseCategory).toHaveBeenCalledWith(entity, entity2);
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
