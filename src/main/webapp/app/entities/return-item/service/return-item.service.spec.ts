import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IReturnItem } from '../return-item.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../return-item.test-samples';

import { ReturnItemService } from './return-item.service';

const requireRestSample: IReturnItem = {
  ...sampleWithRequiredData,
};

describe('ReturnItem Service', () => {
  let service: ReturnItemService;
  let httpMock: HttpTestingController;
  let expectedResult: IReturnItem | IReturnItem[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ReturnItemService);
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

    it('should create a ReturnItem', () => {
      const returnItem = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(returnItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ReturnItem', () => {
      const returnItem = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(returnItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ReturnItem', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ReturnItem', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ReturnItem', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addReturnItemToCollectionIfMissing', () => {
      it('should add a ReturnItem to an empty array', () => {
        const returnItem: IReturnItem = sampleWithRequiredData;
        expectedResult = service.addReturnItemToCollectionIfMissing([], returnItem);
        expect(expectedResult).toEqual([returnItem]);
      });

      it('should not add a ReturnItem to an array that contains it', () => {
        const returnItem: IReturnItem = sampleWithRequiredData;
        const returnItemCollection: IReturnItem[] = [
          {
            ...returnItem,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addReturnItemToCollectionIfMissing(returnItemCollection, returnItem);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ReturnItem to an array that doesn't contain it", () => {
        const returnItem: IReturnItem = sampleWithRequiredData;
        const returnItemCollection: IReturnItem[] = [sampleWithPartialData];
        expectedResult = service.addReturnItemToCollectionIfMissing(returnItemCollection, returnItem);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(returnItem);
      });

      it('should add only unique ReturnItem to an array', () => {
        const returnItemArray: IReturnItem[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const returnItemCollection: IReturnItem[] = [sampleWithRequiredData];
        expectedResult = service.addReturnItemToCollectionIfMissing(returnItemCollection, ...returnItemArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const returnItem: IReturnItem = sampleWithRequiredData;
        const returnItem2: IReturnItem = sampleWithPartialData;
        expectedResult = service.addReturnItemToCollectionIfMissing([], returnItem, returnItem2);
        expect(expectedResult).toEqual([returnItem, returnItem2]);
      });

      it('should accept null and undefined values', () => {
        const returnItem: IReturnItem = sampleWithRequiredData;
        expectedResult = service.addReturnItemToCollectionIfMissing([], null, returnItem, undefined);
        expect(expectedResult).toEqual([returnItem]);
      });

      it('should return initial array if no ReturnItem is added', () => {
        const returnItemCollection: IReturnItem[] = [sampleWithRequiredData];
        expectedResult = service.addReturnItemToCollectionIfMissing(returnItemCollection, undefined, null);
        expect(expectedResult).toEqual(returnItemCollection);
      });
    });

    describe('compareReturnItem', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareReturnItem(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 28210 };
        const entity2 = null;

        const compareResult1 = service.compareReturnItem(entity1, entity2);
        const compareResult2 = service.compareReturnItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 28210 };
        const entity2 = { id: 12707 };

        const compareResult1 = service.compareReturnItem(entity1, entity2);
        const compareResult2 = service.compareReturnItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 28210 };
        const entity2 = { id: 28210 };

        const compareResult1 = service.compareReturnItem(entity1, entity2);
        const compareResult2 = service.compareReturnItem(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
