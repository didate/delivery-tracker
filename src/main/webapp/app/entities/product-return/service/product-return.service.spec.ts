import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IProductReturn } from '../product-return.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../product-return.test-samples';

import { ProductReturnService, RestProductReturn } from './product-return.service';

const requireRestSample: RestProductReturn = {
  ...sampleWithRequiredData,
  returnDate: sampleWithRequiredData.returnDate?.format(DATE_FORMAT),
};

describe('ProductReturn Service', () => {
  let service: ProductReturnService;
  let httpMock: HttpTestingController;
  let expectedResult: IProductReturn | IProductReturn[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ProductReturnService);
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

    it('should create a ProductReturn', () => {
      const productReturn = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(productReturn).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ProductReturn', () => {
      const productReturn = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(productReturn).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ProductReturn', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ProductReturn', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ProductReturn', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addProductReturnToCollectionIfMissing', () => {
      it('should add a ProductReturn to an empty array', () => {
        const productReturn: IProductReturn = sampleWithRequiredData;
        expectedResult = service.addProductReturnToCollectionIfMissing([], productReturn);
        expect(expectedResult).toEqual([productReturn]);
      });

      it('should not add a ProductReturn to an array that contains it', () => {
        const productReturn: IProductReturn = sampleWithRequiredData;
        const productReturnCollection: IProductReturn[] = [
          {
            ...productReturn,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addProductReturnToCollectionIfMissing(productReturnCollection, productReturn);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ProductReturn to an array that doesn't contain it", () => {
        const productReturn: IProductReturn = sampleWithRequiredData;
        const productReturnCollection: IProductReturn[] = [sampleWithPartialData];
        expectedResult = service.addProductReturnToCollectionIfMissing(productReturnCollection, productReturn);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(productReturn);
      });

      it('should add only unique ProductReturn to an array', () => {
        const productReturnArray: IProductReturn[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const productReturnCollection: IProductReturn[] = [sampleWithRequiredData];
        expectedResult = service.addProductReturnToCollectionIfMissing(productReturnCollection, ...productReturnArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const productReturn: IProductReturn = sampleWithRequiredData;
        const productReturn2: IProductReturn = sampleWithPartialData;
        expectedResult = service.addProductReturnToCollectionIfMissing([], productReturn, productReturn2);
        expect(expectedResult).toEqual([productReturn, productReturn2]);
      });

      it('should accept null and undefined values', () => {
        const productReturn: IProductReturn = sampleWithRequiredData;
        expectedResult = service.addProductReturnToCollectionIfMissing([], null, productReturn, undefined);
        expect(expectedResult).toEqual([productReturn]);
      });

      it('should return initial array if no ProductReturn is added', () => {
        const productReturnCollection: IProductReturn[] = [sampleWithRequiredData];
        expectedResult = service.addProductReturnToCollectionIfMissing(productReturnCollection, undefined, null);
        expect(expectedResult).toEqual(productReturnCollection);
      });
    });

    describe('compareProductReturn', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareProductReturn(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 8123 };
        const entity2 = null;

        const compareResult1 = service.compareProductReturn(entity1, entity2);
        const compareResult2 = service.compareProductReturn(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 8123 };
        const entity2 = { id: 20976 };

        const compareResult1 = service.compareProductReturn(entity1, entity2);
        const compareResult2 = service.compareProductReturn(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 8123 };
        const entity2 = { id: 8123 };

        const compareResult1 = service.compareProductReturn(entity1, entity2);
        const compareResult2 = service.compareProductReturn(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
