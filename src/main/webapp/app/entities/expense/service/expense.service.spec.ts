import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IExpense } from '../expense.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../expense.test-samples';

import { ExpenseService, RestExpense } from './expense.service';

const requireRestSample: RestExpense = {
  ...sampleWithRequiredData,
  expenseDate: sampleWithRequiredData.expenseDate?.format(DATE_FORMAT),
};

describe('Expense Service', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;
  let expectedResult: IExpense | IExpense[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ExpenseService);
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

    it('should create a Expense', () => {
      const expense = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(expense).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Expense', () => {
      const expense = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(expense).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Expense', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Expense', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Expense', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addExpenseToCollectionIfMissing', () => {
      it('should add a Expense to an empty array', () => {
        const expense: IExpense = sampleWithRequiredData;
        expectedResult = service.addExpenseToCollectionIfMissing([], expense);
        expect(expectedResult).toEqual([expense]);
      });

      it('should not add a Expense to an array that contains it', () => {
        const expense: IExpense = sampleWithRequiredData;
        const expenseCollection: IExpense[] = [
          {
            ...expense,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addExpenseToCollectionIfMissing(expenseCollection, expense);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Expense to an array that doesn't contain it", () => {
        const expense: IExpense = sampleWithRequiredData;
        const expenseCollection: IExpense[] = [sampleWithPartialData];
        expectedResult = service.addExpenseToCollectionIfMissing(expenseCollection, expense);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(expense);
      });

      it('should add only unique Expense to an array', () => {
        const expenseArray: IExpense[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const expenseCollection: IExpense[] = [sampleWithRequiredData];
        expectedResult = service.addExpenseToCollectionIfMissing(expenseCollection, ...expenseArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const expense: IExpense = sampleWithRequiredData;
        const expense2: IExpense = sampleWithPartialData;
        expectedResult = service.addExpenseToCollectionIfMissing([], expense, expense2);
        expect(expectedResult).toEqual([expense, expense2]);
      });

      it('should accept null and undefined values', () => {
        const expense: IExpense = sampleWithRequiredData;
        expectedResult = service.addExpenseToCollectionIfMissing([], null, expense, undefined);
        expect(expectedResult).toEqual([expense]);
      });

      it('should return initial array if no Expense is added', () => {
        const expenseCollection: IExpense[] = [sampleWithRequiredData];
        expectedResult = service.addExpenseToCollectionIfMissing(expenseCollection, undefined, null);
        expect(expectedResult).toEqual(expenseCollection);
      });
    });

    describe('compareExpense', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareExpense(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 17742 };
        const entity2 = null;

        const compareResult1 = service.compareExpense(entity1, entity2);
        const compareResult2 = service.compareExpense(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 17742 };
        const entity2 = { id: 9220 };

        const compareResult1 = service.compareExpense(entity1, entity2);
        const compareResult2 = service.compareExpense(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 17742 };
        const entity2 = { id: 17742 };

        const compareResult1 = service.compareExpense(entity1, entity2);
        const compareResult2 = service.compareExpense(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
