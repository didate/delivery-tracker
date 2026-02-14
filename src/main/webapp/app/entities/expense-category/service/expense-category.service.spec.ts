import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IExpenseCategory } from '../expense-category.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../expense-category.test-samples';

import { ExpenseCategoryService } from './expense-category.service';

const requireRestSample: IExpenseCategory = {
  ...sampleWithRequiredData,
};

describe('ExpenseCategory Service', () => {
  let service: ExpenseCategoryService;
  let httpMock: HttpTestingController;
  let expectedResult: IExpenseCategory | IExpenseCategory[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ExpenseCategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a ExpenseCategory', () => {
      const expenseCategory = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(expenseCategory).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ExpenseCategory', () => {
      const expenseCategory = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(expenseCategory).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ExpenseCategory', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ExpenseCategory', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ExpenseCategory', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addExpenseCategoryToCollectionIfMissing', () => {
      it('should add a ExpenseCategory to an empty array', () => {
        const expenseCategory: IExpenseCategory = sampleWithRequiredData;
        expectedResult = service.addExpenseCategoryToCollectionIfMissing([], expenseCategory);
        expect(expectedResult).toEqual([expenseCategory]);
      });

      it('should not add a ExpenseCategory to an array that contains it', () => {
        const expenseCategory: IExpenseCategory = sampleWithRequiredData;
        const expenseCategoryCollection: IExpenseCategory[] = [
          {
            ...expenseCategory,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addExpenseCategoryToCollectionIfMissing(expenseCategoryCollection, expenseCategory);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ExpenseCategory to an array that doesn't contain it", () => {
        const expenseCategory: IExpenseCategory = sampleWithRequiredData;
        const expenseCategoryCollection: IExpenseCategory[] = [sampleWithPartialData];
        expectedResult = service.addExpenseCategoryToCollectionIfMissing(expenseCategoryCollection, expenseCategory);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(expenseCategory);
      });

      it('should add only unique ExpenseCategory to an array', () => {
        const expenseCategoryArray: IExpenseCategory[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const expenseCategoryCollection: IExpenseCategory[] = [sampleWithRequiredData];
        expectedResult = service.addExpenseCategoryToCollectionIfMissing(expenseCategoryCollection, ...expenseCategoryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const expenseCategory: IExpenseCategory = sampleWithRequiredData;
        const expenseCategory2: IExpenseCategory = sampleWithPartialData;
        expectedResult = service.addExpenseCategoryToCollectionIfMissing([], expenseCategory, expenseCategory2);
        expect(expectedResult).toEqual([expenseCategory, expenseCategory2]);
      });

      it('should accept null and undefined values', () => {
        const expenseCategory: IExpenseCategory = sampleWithRequiredData;
        expectedResult = service.addExpenseCategoryToCollectionIfMissing([], null, expenseCategory, undefined);
        expect(expectedResult).toEqual([expenseCategory]);
      });

      it('should return initial array if no ExpenseCategory is added', () => {
        const expenseCategoryCollection: IExpenseCategory[] = [sampleWithRequiredData];
        expectedResult = service.addExpenseCategoryToCollectionIfMissing(expenseCategoryCollection, undefined, null);
        expect(expectedResult).toEqual(expenseCategoryCollection);
      });
    });

    describe('compareExpenseCategory', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareExpenseCategory(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 17564 };
        const entity2 = null;

        const compareResult1 = service.compareExpenseCategory(entity1, entity2);
        const compareResult2 = service.compareExpenseCategory(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 17564 };
        const entity2 = { id: 28308 };

        const compareResult1 = service.compareExpenseCategory(entity1, entity2);
        const compareResult2 = service.compareExpenseCategory(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 17564 };
        const entity2 = { id: 17564 };

        const compareResult1 = service.compareExpenseCategory(entity1, entity2);
        const compareResult2 = service.compareExpenseCategory(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
