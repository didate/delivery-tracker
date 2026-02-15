import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IExpenseCategory } from '../expense-category.model';
import { ExpenseCategoryService } from '../service/expense-category.service';

import { ExpenseCategoryFormService } from './expense-category-form.service';
import { ExpenseCategoryUpdate } from './expense-category-update';

describe('ExpenseCategory Management Update Component', () => {
  let comp: ExpenseCategoryUpdate;
  let fixture: ComponentFixture<ExpenseCategoryUpdate>;
  let activatedRoute: ActivatedRoute;
  let expenseCategoryFormService: ExpenseCategoryFormService;
  let expenseCategoryService: ExpenseCategoryService;

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

    fixture = TestBed.createComponent(ExpenseCategoryUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    expenseCategoryFormService = TestBed.inject(ExpenseCategoryFormService);
    expenseCategoryService = TestBed.inject(ExpenseCategoryService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const expenseCategory: IExpenseCategory = { id: 28308 };

      activatedRoute.data = of({ expenseCategory });
      comp.ngOnInit();

      expect(comp.expenseCategory).toEqual(expenseCategory);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExpenseCategory>>();
      const expenseCategory = { id: 17564 };
      vitest.spyOn(expenseCategoryFormService, 'getExpenseCategory').mockReturnValue(expenseCategory);
      vitest.spyOn(expenseCategoryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ expenseCategory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: expenseCategory }));
      saveSubject.complete();

      // THEN
      expect(expenseCategoryFormService.getExpenseCategory).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(expenseCategoryService.update).toHaveBeenCalledWith(expect.objectContaining(expenseCategory));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExpenseCategory>>();
      const expenseCategory = { id: 17564 };
      vitest.spyOn(expenseCategoryFormService, 'getExpenseCategory').mockReturnValue({ id: null });
      vitest.spyOn(expenseCategoryService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ expenseCategory: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: expenseCategory }));
      saveSubject.complete();

      // THEN
      expect(expenseCategoryFormService.getExpenseCategory).toHaveBeenCalled();
      expect(expenseCategoryService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IExpenseCategory>>();
      const expenseCategory = { id: 17564 };
      vitest.spyOn(expenseCategoryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ expenseCategory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(expenseCategoryService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
